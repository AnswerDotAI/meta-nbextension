# meta-nbextension

This is an nbextension for Jupyter Notebook (nbclassic) v6. It doesn't work for the latest v7 which is a skin of
Jupyter Lab.

After installing it, all notebooks will have an `nbmeta` variable automatically created and kept updated, which
contains the current cell index and notebook name. This has only been tested inside regular notebook execution; it
might not work in other contexts, such as nbconvert.

In addition, the `set_next_input` js payload is modified to take an optional `ctype` argument, for the cell type to
create (i.e. 'code' or 'markdown'). This function can be used to access this functionality:

```python
def set_next_cell(text, code=True, replace=False, execute=False):
    if not code: execute=True
    ip.payload_manager.write_payload(dict(
        source='set_next_input',
        replace=replace, execute=execute,
        text=text, ctype='code' if code else 'markdown'))
```

