# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('report', '0003_auto_20150324_1912'),
    ]

    operations = [
        migrations.RenameField(
            model_name='report',
            old_name='nombre',
            new_name='broken_bikes',
        ),
    ]
