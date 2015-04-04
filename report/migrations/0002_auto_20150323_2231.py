# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('report', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='report',
            name='nombre',
            field=models.IntegerField(db_column='Nombre de vélos cassés'),
            preserve_default=True,
        ),
    ]
