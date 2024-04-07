define([ 'base/js/namespace', 'base/js/events', 'notebook/js/notebook', 'notebook/js/codecell' ],
function(Jupyter, events, notebook, codecell) {
    function patchCodeCellExecute() {
        var originalExecute = codecell.CodeCell.prototype.execute;
        codecell.CodeCell.prototype.execute = function() {
            var code = `from IPython import get_ipython
def receive_nbmeta(data):
    nbmeta = get_ipython().user_ns.setdefault('nbmeta', {})
    nbmeta['cell'] = data['cellIndex']
    nbmeta['name'] = data['notebookName']`;
            Jupyter.notebook.kernel.execute( code);
            var cellIndex = Jupyter.notebook.find_cell_index(this);
            var data = { cellIndex: cellIndex, notebookName: Jupyter.notebook.notebook_name };
            Jupyter.notebook.kernel.execute(`receive_nbmeta(${JSON.stringify(data)})`);
            originalExecute.apply(this, arguments);
        };
    }

    function patchSetNextInput() {
        IPython.CodeCell.prototype._handle_set_next_input = function(payload) {
            payload.cell = this;
            this.events.trigger('set_next_input.Notebook', payload);
        };

        var that = IPython.notebook;
        that.events.unbind("set_next_input.Notebook");
        that.events.on('set_next_input.Notebook', function(event, data) {
            if (data.replace) {
                data.cell.set_text(data.text);
                if (data.clear_output !== false) { data.cell.clear_output(); }
            } else {
                var index = that.find_cell_index(data.cell);
                var new_cell = that.insert_cell_below(data.ctype || 'code', index);
                new_cell.set_text(data.text);
                if (data.execute && data.execute === true) { new_cell.execute(); }
                else { that.dirty = true; }
            }
        });
    }

    function load_extension() {
        patchCodeCellExecute();
        patchSetNextInput();
    }

    return { load_ipython_extension: load_extension };
});

