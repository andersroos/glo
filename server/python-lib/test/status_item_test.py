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

    def test_callback_is_called_on_item_get__even_after_setting_value(self):
        self.assertEqual(63, StatusItem(key='x', value=lambda: 63).item()['value'])

        s = StatusItem(key='x', value=lambda: 10)
        s.set(18)
        self.assertEqual(10, s.item()['value'])
