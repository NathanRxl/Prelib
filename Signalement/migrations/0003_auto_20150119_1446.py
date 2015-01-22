# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Signalement', '0002_auto_20150113_0905'),
    ]

    operations = [
        migrations.AlterField(
            model_name='global',
            name='report_date',
            field=models.DateTimeField(auto_now_add=True, verbose_name='report date'),
            preserve_default=True,
        ),
    ]
