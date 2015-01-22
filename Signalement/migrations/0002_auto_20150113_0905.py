# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Signalement', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='global',
            name='station_capacity',
        ),
        migrations.AddField(
            model_name='global',
            name='station_loss',
            field=models.IntegerField(verbose_name='Broken bikes', default=0),
            preserve_default=True,
        ),
    ]
