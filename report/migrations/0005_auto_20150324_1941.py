# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('report', '0004_auto_20150324_1926'),
    ]

    operations = [
        migrations.AlterField(
            model_name='report',
            name='broken_bikes',
            field=models.IntegerField(verbose_name='Number of broken bikes'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='report',
            name='date',
            field=models.DateTimeField(verbose_name='Date of report'),
            preserve_default=True,
        ),
    ]
