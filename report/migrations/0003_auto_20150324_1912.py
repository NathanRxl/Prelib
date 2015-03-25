# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('report', '0002_auto_20150323_2231'),
    ]

    operations = [
        migrations.AlterField(
            model_name='report',
            name='date',
            field=models.DateTimeField(verbose_name='Date de report'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='report',
            name='nombre',
            field=models.IntegerField(verbose_name='Nombre de vélos cassés'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='report',
            name='station',
            field=models.CharField(verbose_name='Station', max_length=50),
            preserve_default=True,
        ),
    ]
