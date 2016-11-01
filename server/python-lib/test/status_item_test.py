from unittest import TestCase

from glo import StatusItem, Tag


class Test(TestCase):
    
    def test_basic_item_is_returned(self):
        s = StatusItem(path='/a/path', tag=Tag.COUNT, description='sune', level=1, value=2)
        self.assertEqual(dict(value=2,
                              description='sune',
                              key='/a/path:count',
                              lvl=1),
                         s.item())
