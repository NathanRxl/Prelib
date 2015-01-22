# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Global',
            fields=[
                ('id', models.AutoField(serialize=False, auto_created=True, primary_key=True, verbose_name='ID')),
                ('station_name', models.CharField(max_length=200)),
                ('report_date', models.DateTimeField(verbose_name='date of report')),
                ('station_capacity', models.IntegerField(verbose_name='Disposable bikes')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
