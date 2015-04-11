from django.db import models
from django.utils.translation import ugettext_lazy as _t


__all__ = ['ChineseMetadata', 'ChineseWord']


class ChineseMetadata(models.Model):
  native = models.BooleanField(verbose_name=_t("Native speaker"))
  gender = models.CharField(verbose_name=_t("Gender"), max_length=255)


class ChineseWord(models.Model):
  word = models.CharField(verbose_name=_t('Word'), max_length=255)
  wave = models.BinaryField(verbose_name=_t('Wave'), null=True, blank=True)
  metadata = models.ForeignKey(ChineseMetadata, related_name='words')
