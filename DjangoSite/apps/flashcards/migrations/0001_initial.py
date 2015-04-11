# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='FlashCard',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('english', models.TextField(null=True, verbose_name='English', blank=True)),
                ('chinese', models.TextField(null=True, verbose_name='Chinese', blank=True)),
                ('category', models.CharField(max_length=255, null=True, verbose_name='Category', blank=True)),
                ('tone', models.BinaryField(verbose_name='Tone', null=True, blank=True)),
            ],
        ),
    ]
