import os.path

from setuptools import setup


with open(os.path.join(os.path.dirname(__file__), "readme.md"), "r") as f:
    long_description = f.read()


setup(
    name="Refs",
    version="1.0",
    packages=["refs"],
    url="https://beatonma.org",
    license="",
    author="michael",
    author_email="michael@beatonma.org",
    description="A tool that counts references to resources.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    entry_points={
        "console_scripts": [
            "refs = refs.refs:main",
        ],
    },
)
