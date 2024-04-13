define([ 'base/js/namespace', 'base/js/events', 'notebook/js/notebook', 'notebook/js/codecell' ],
function(Jupyter, events, notebook, codecell) {
    function patchCodeCellExecute() {
        var proto = codecell.CodeCell.prototype;
        var orig = proto.execute;
        if (orig.isPatched) { return; }
        proto.execute = function() {
            var code = `from IPython import get_ipython
def receive_nbmeta(data):
    nbmeta = get_ipython().user_ns.setdefault('nbmeta', {})
    nbmeta['idx'] = data['idx']
    nbmeta['cells'] = data['cells']
    nbmeta['name'] = data['name']`;
            nb = Jupyter.notebook;
            nb.kernel.execute( code);
            var cellsData = nb.get_cells().map(cell => {
                var cellData = { cell_type: cell.cell_type, source: cell.get_text() };
                if (cell.cell_type === 'code') {
                    cellData.outputs = cell.output_area.outputs.map(output => {
                        var outputData = { output_type: output.output_type };
                        if (output.output_type === 'stream') {
                            outputData.name = output.name;
                            outputData.text = output.text;
                        } else if (output.output_type === 'execute_result' || output.output_type === 'display_data') {
                            if (output.data['text/plain']) { outputData.data = output.data['text/plain']; }
                        }
                        return outputData;
                    });
                }
                return cellData;
            });
            var data = { idx: nb.find_cell_index(this), name: nb.notebook_name, cells: cellsData};
            try       { var serialized = JSON.stringify(data); }
            catch (e) { console.error('Failed to serialize cell data:', e); }
            nb.kernel.execute(`receive_nbmeta(${serialized})`);
            orig.apply(this, arguments);
        };
        proto.execute.isPatched = true;
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

