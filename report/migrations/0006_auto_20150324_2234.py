# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.utils.timezone import utc
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('report', '0005_auto_20150324_1941'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='report',
            name='date',
        ),
        migrations.AddField(
            model_name='report',
            name='report_date',
            field=models.DateTimeField(default=datetime.datetime(2015, 3, 24, 21, 34, 53, 665955, tzinfo=utc), verbose_name='Date of report'),
            preserve_default=True,
        ),
    ]
