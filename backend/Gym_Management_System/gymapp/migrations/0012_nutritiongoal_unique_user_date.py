# Generated by Django 5.1.6 on 2025-03-10 17:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gymapp', '0011_alter_nutritiongoal_user'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='nutritiongoal',
            constraint=models.UniqueConstraint(fields=('user', 'created_at'), name='unique_user_date'),
        ),
    ]
