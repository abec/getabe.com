# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ChineseMetadata',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('native', models.BooleanField(verbose_name='Native speaker')),
                ('gender', models.CharField(max_length=255, verbose_name='Gender')),
            ],
        ),
        migrations.CreateModel(
            name='ChineseWord',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('word', models.CharField(max_length=255, verbose_name='Word')),
                ('wave', models.BinaryField(verbose_name='Wave', null=True, blank=True)),
                ('metadata', models.ForeignKey(related_name='words', to='tones.ChineseMetadata')),
            ],
        ),
    ]
