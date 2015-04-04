# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('report', '0011_auto_20150328_2017'),
    ]

    operations = [
        migrations.AlterField(
            model_name='report',
            name='report_date',
            field=models.DateTimeField(default=datetime.datetime(2015, 3, 28, 19, 19, 39, 472682, tzinfo=utc), verbose_name='Date of report'),
            preserve_default=True,
        ),
    ]
