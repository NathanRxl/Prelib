# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('report', '0008_auto_20150325_1121'),
    ]

    operations = [
        migrations.AlterField(
            model_name='report',
            name='report_date',
            field=models.DateTimeField(default=datetime.datetime(2015, 3, 25, 14, 20, 33, 246963, tzinfo=utc), verbose_name='Date of report'),
            preserve_default=True,
        ),
    ]
