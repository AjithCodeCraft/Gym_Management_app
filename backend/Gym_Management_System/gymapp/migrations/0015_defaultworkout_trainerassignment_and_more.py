# Generated by Django 5.1.6 on 2025-03-15 04:13

import django.core.validators
import django.db.models.deletion
import django.utils.timezone
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gymapp', '0014_alter_nutritiongoal_created_at'),
    ]

    operations = [
        migrations.CreateModel(
            name='DefaultWorkout',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('day', models.CharField(choices=[('sunday', 'Sunday'), ('monday', 'Monday'), ('tuesday', 'Tuesday'), ('wednesday', 'Wednesday'), ('thursday', 'Thursday'), ('friday', 'Friday'), ('saturday', 'Saturday')], max_length=10)),
            ],
        ),
        migrations.RemoveField(
            model_name='usercompletedexercise',
            name='exercise',
        ),
        migrations.RemoveField(
            model_name='usercompletedexercise',
            name='user_workout',
        ),
        migrations.RemoveField(
            model_name='userworkout',
            name='user',
        ),
        migrations.RemoveField(
            model_name='userworkout',
            name='workout_day',
        ),
        migrations.RemoveField(
            model_name='exercise',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='exercise',
            name='description',
        ),
        migrations.RemoveField(
            model_name='exercise',
            name='equipment',
        ),
        migrations.RemoveField(
            model_name='exercise',
            name='muscle_group',
        ),
        migrations.RemoveField(
            model_name='exercise',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='workoutexercise',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='workoutexercise',
            name='order_in_workout',
        ),
        migrations.RemoveField(
            model_name='workoutexercise',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='workoutexercise',
            name='weight',
        ),
        migrations.RemoveField(
            model_name='workoutexercise',
            name='workout_day',
        ),
        migrations.AddField(
            model_name='workoutexercise',
            name='rest',
            field=models.IntegerField(default=10, validators=[django.core.validators.MinValueValidator(10)]),
        ),
        migrations.AddField(
            model_name='workoutexercise',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('done', 'Done')], default='pending', max_length=10),
        ),
        migrations.AlterField(
            model_name='exercise',
            name='name',
            field=models.CharField(max_length=255, unique=True),
        ),
        migrations.AlterField(
            model_name='payment',
            name='payment_method',
            field=models.CharField(choices=[('online', 'Online'), ('offline', 'Offline'), ('fortifit', 'Fortifit')], default='online', max_length=10),
        ),
        migrations.AlterField(
            model_name='workoutexercise',
            name='exercise',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exercise_instance', to='gymapp.exercise'),
        ),
        migrations.AlterField(
            model_name='workoutexercise',
            name='reps',
            field=models.IntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)]),
        ),
        migrations.AlterField(
            model_name='workoutexercise',
            name='sets',
            field=models.IntegerField(default=1, validators=[django.core.validators.MinValueValidator(1)]),
        ),
        migrations.CreateModel(
            name='DailyWorkout',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('date', models.DateField(default=django.utils.timezone.now)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workout_history', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='workoutexercise',
            name='workout',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, related_name='workout_exercise', to='gymapp.dailyworkout', null=True),
            preserve_default=False,
        ),
        migrations.AddConstraint(
            model_name='workoutexercise',
            constraint=models.UniqueConstraint(fields=('workout', 'exercise'), name='unique_workout_exercise'),
        ),
        migrations.AddField(
            model_name='defaultworkout',
            name='exercises',
            field=models.ManyToManyField(related_name='daily_exersises', to='gymapp.exercise'),
        ),
        migrations.AddField(
            model_name='defaultworkout',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='default_workout', to=settings.AUTH_USER_MODEL),
        ),
        migrations.DeleteModel(
            name='UserCompletedExercise',
        ),
        migrations.DeleteModel(
            name='UserWorkout',
        ),
        migrations.AddConstraint(
            model_name='defaultworkout',
            constraint=models.UniqueConstraint(fields=('user', 'day'), name='user_default_workout'),
        ),
                migrations.CreateModel(
            name='TrainerAssignment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('assigned_at', models.DateTimeField(auto_now_add=True)),
                ('trainer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assigned_users', to=settings.AUTH_USER_MODEL)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='assigned_trainer', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.DeleteModel(
            name='DefaultUserMetrics',
        ),
    ]
