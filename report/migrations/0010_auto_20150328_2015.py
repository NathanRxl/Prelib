# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('report', '0009_auto_20150325_1520'),
    ]

    operations = [
        migrations.RenameField(
            model_name='report',
            old_name='id_station',
            new_name='station_id',
        ),
        migrations.AlterField(
            model_name='report',
            name='report_date',
            field=models.DateTimeField(verbose_name='Date of report', default=datetime.datetime(2015, 3, 28, 19, 15, 25, 475286, tzinfo=utc)),
            preserve_default=True,
        ),
    ]
