import json
from unittest import TestCase

from refs.reports import report_html
from refs.refs import scan_resources


class SampleTest(TestCase):
    def setUp(self) -> None:
        self.results = scan_resources(src="./test/data/")
        print(json.dumps(self.results, indent=2))

    def test_test_discovery(self):
        report_html(self.results)
        self.assertTrue(False)
