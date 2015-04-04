# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('report', '0006_auto_20150324_2234'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='report',
            name='station',
        ),
        migrations.AddField(
            model_name='report',
            name='id_station',
            field=models.IntegerField(default=1, verbose_name='Station'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='report',
            name='report_date',
            field=models.DateTimeField(default=datetime.datetime(2015, 3, 24, 22, 17, 38, 523993, tzinfo=utc), verbose_name='Date of report'),
            preserve_default=True,
        ),
    ]
