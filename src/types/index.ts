export interface Customer {
  id?: number;
  name: string;
  phone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  id?: number;
  customerId: number;
  projectName: string;
  faceSide: 'left' | 'right' | 'full';
  date: string;
  status: 'ongoing' | 'completed';
  createdAt: string;
}

export interface InjectionPoint {
  id?: number;
  treatmentId: number;
  pointNumber: number;
  x: number;
  y: number;
  templateView: 'front' | '45deg' | 'side';
  productName: string;
  layer: string;
  dosage: number;
  needleCount: number;
  notes: string;
}

export interface Photo {
  id?: number;
  treatmentId: number;
  type: 'pre-op' | 'post-op';
  imageBlob: string;
  takenAt: string;
}

export interface Reminder {
  id?: number;
  treatmentId: number;
  customerId: number;
  remindDate: string;
  content: string;
  completed: boolean;
}

export type TemplateView = 'front' | '45deg' | 'side';
export type FaceSide = 'left' | 'right' | 'full';
export type TabName = 'customers' | 'canvas' | 'photos' | 'print' | 'calendar';

export const PRODUCT_LIST = [
  '保妥适/Botox',
  '衡力',
  '吉适/Dysport',
  '乔雅登/Juvéderm',
  '瑞蓝/Restylane',
  '伊婉/YVOIRE',
  '艾莉薇/Elravie',
  '海薇/Mesotherapy',
  '润百颜',
  '嗨体',
  '双美',
  '少女针/Ellansé',
  '童颜针/Sculptra',
  '濡白天使',
  '如生天使',
  '宝尼达',
  '爱贝芙/Artecoll',
  '法思丽/Facial',
  '胶原蛋白',
  '其他',
];

export const LAYER_LIST = [
  '真皮浅层',
  '真皮深层',
  '皮下脂肪层',
  'SMAS筋膜层',
  '骨膜上方',
  '肌肉层',
  '避开血管',
  '沿骨面注射',
  '扇形注射',
  '点状注射',
  '线性注射',
  '分层注射',
];

export const QUICK_NOTES = [
  '避开血管',
  '注意眶下孔',
  '注意面神经颧支',
  '缓慢推注',
  '少量多次',
  '退针推药',
  '先回抽再注射',
  '注意颏神经',
  '注射后按压',
  '冰敷5分钟',
];
