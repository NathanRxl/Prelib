# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, auto_created=True, verbose_name='ID')),
                ('date', models.DateTimeField(db_column='Date de report')),
                ('station', models.CharField(db_column='Station', max_length=50)),
                ('nombre', models.IntegerField(db_column='Nombre de velos casses')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
