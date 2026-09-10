import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
        ('skills', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='IndustryAssessment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True, default='')),
                ('assessment_type', models.CharField(choices=[('questionnaire', 'Questionnaire'), ('aptitude', 'Aptitude Test')], default='questionnaire', max_length=20)),
                ('duration_minutes', models.IntegerField(default=30)),
                ('passing_score', models.FloatField(default=50)),
                ('max_attempts', models.IntegerField(default=1)),
                ('active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assessments', to='accounts.industryprofile')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='IndustryAssessmentQuestion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question_type', models.CharField(choices=[('mcq', 'Multiple Choice'), ('true_false', 'True / False')], default='mcq', max_length=20)),
                ('category', models.CharField(choices=[('technical', 'Technical'), ('logical', 'Logical Reasoning'), ('quantitative', 'Quantitative Aptitude'), ('verbal', 'Verbal Reasoning'), ('numerical', 'Numerical Ability'), ('problem_solving', 'Problem Solving')], default='technical', max_length=20)),
                ('text', models.TextField()),
                ('option_a', models.CharField(blank=True, default='', max_length=300)),
                ('option_b', models.CharField(blank=True, default='', max_length=300)),
                ('option_c', models.CharField(blank=True, default='', max_length=300)),
                ('option_d', models.CharField(blank=True, default='', max_length=300)),
                ('correct_option', models.CharField(choices=[('a', 'A'), ('b', 'B'), ('c', 'C'), ('d', 'D')], max_length=1)),
                ('marks', models.FloatField(default=1)),
                ('order', models.IntegerField(default=0)),
                ('assessment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='questions', to='skills.industryassessment')),
            ],
            options={
                'ordering': ['order', 'id'],
            },
        ),
        migrations.CreateModel(
            name='IndustryAssessmentAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('attempt_number', models.IntegerField(default=1)),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('total_marks', models.FloatField(default=0)),
                ('scored_marks', models.FloatField(default=0)),
                ('percentage', models.FloatField(default=0)),
                ('passed', models.BooleanField(default=False)),
                ('category_breakdown', models.JSONField(default=dict)),
                ('assessment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attempts', to='skills.industryassessment')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='industry_assessment_attempts', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-started_at'],
            },
        ),
        migrations.CreateModel(
            name='IndustryAssessmentAnswer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('selected_option', models.CharField(blank=True, default='', max_length=1)),
                ('is_correct', models.BooleanField(default=False)),
                ('attempt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='skills.industryassessmentattempt')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='skills.industryassessmentquestion')),
            ],
        ),
    ]
