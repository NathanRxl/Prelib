# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('report', '0007_auto_20150324_2317'),
    ]

    operations = [
        migrations.AlterField(
            model_name='report',
            name='id_station',
            field=models.IntegerField(verbose_name='Station id'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='report',
            name='report_date',
            field=models.DateTimeField(verbose_name='Date of report', default=datetime.datetime(2015, 3, 25, 10, 21, 28, 454960, tzinfo=utc)),
            preserve_default=True,
        ),
    ]
