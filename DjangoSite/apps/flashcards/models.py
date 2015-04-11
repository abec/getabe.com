
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import ugettext_lazy as _t
import goslate


__all__ = ['FlashCard']


class FlashCard(models.Model):
  english = models.TextField(verbose_name=_t('English'), null=True, blank=True)
  chinese = models.TextField(verbose_name=_t('Chinese'), null=True, blank=True)
  category = models.CharField(verbose_name=_t('Category'), max_length=255, null=True, blank=True)
  tone = models.BinaryField(verbose_name=_t('Tone'), null=True, blank=True)

  def clean(self):
    if self.english is None and self.chinese is None:
      raise ValidationError('An english word or chinese word should be provided.')

  def save(self, *args, **kwargs):
    gs = goslate.Goslate(writing=goslate.WRITING_ROMAN)

    if self.english is None:
      self.english = gs.translate(self.chinese, "en")

    if self.chinese is None:
      self.chinese = gs.translate(self.english, "zh")

    super(FlashCard, self).save(*args, **kwargs)
