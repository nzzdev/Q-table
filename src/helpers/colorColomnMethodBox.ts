import type { BucketType } from '../interfaces';
import type { FormattedBucket } from './colorColumnLegend';

const methodBoxTextConfig: Record<BucketType, string> = {
  ckmeans:
    'Die unterschiedlich grossen Gruppen kommen durch ein statistisches Verfahren zustande, welches die Werte so in Gruppen einteilt, dass die Unterschiede zwischen den Regionen möglichst gut sichtbar werden (Jenks Natural Breaks).',
  quantile: 'Die Gruppen wurden so gewählt, dass in jeder Gruppe möglichst gleich viele Werte vorhanden sind.',
  equal: 'Die Gruppen wurden so gewählt, dass sie jeweils einen gleich grossen Bereich auf der Skala abdecken.',
  custom: 'Die Gruppen wurden manuell definiert.',
};

export function getMethodBoxInfo(bucketType: BucketType): MethodBoxInfo {
  const methodBoxText = methodBoxTextConfig[bucketType];

  return {
    text: methodBoxText || '',
    article: {
      title: 'Mehr zur Datenberechnung der NZZ',
      url: 'https://www.nzz.ch/ld.1580452',
    },
  };
}

export interface MethodBoxInfo {
  text: string;
  article: {
    title: string;
    url: string;
  };
  formattedBuckets?: FormattedBucket[];
}
