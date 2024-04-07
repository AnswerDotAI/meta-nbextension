import setuptools

setuptools.setup(
    name="meta-nbextension",
    version="0.1.1",
    packages=setuptools.find_packages(),
    author="Jeremy Howard",
    author_email="info@fast.ai",
    description="Access to current notebook and cell in an nbclassic notebook",
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url="https://github.com/answerdotai/meta-nbextension",
    license='Apache License 2.0',
    python_requires='>=3.6',
    install_requires=[ 'notebook<7' ],
    classifiers=[
        "Programming Language :: Python :: 3",
        'License :: OSI Approved :: Apache Software License',
        "Operating System :: OS Independent",
        "Framework :: Jupyter",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "Topic :: Software Development",
        "Topic :: Scientific/Engineering",
    ],
    include_package_data=True,
    data_files=[
        ("share/jupyter/nbextensions/nbmeta", [ "nbmeta/static/nbmeta.js", ]),
        ("etc/jupyter/nbconfig/notebook.d", [ "jupyter-config/nbconfig/notebook.d/nbmeta.json" ])
    ],
    zip_safe=False
)

