import { BuildOptions, Model } from "sequelize";

export interface ProjectsAttributes {
  id?: number;
  name: string;                     // اسم المشروع (المختصر)
  officialName: string;             // اسم المشروع (الرسمي)
  contractorName: string;           // اسم المقاول
  ownerName: string;                // المالك والمشغل
  advisorName?: string;              // اسم الاستشارى
  location: string;                 // الموقع (الحي - المدينة - المحافظة)
  contractValue: number;            // قيمة العقد (بالريال السعودي)
  beneficiariesCount: number;       // تقدير عدد المستفيدين
  originalPeriod: number;           // فترة التنفيذ الأصلية بالأشهر
  modifiedPeriod: number;           // فترة التنفيذ بعد التعديل بالأشهر
  startDate: Date;                  // تاريخ ابتداء الموقع
  expirationDate: Date;             // تاريخ استلام الموقع
  currentExpirationDate?: Date;     // التاريخ المخطط حالياً للانتهاء
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectsModel extends Model<ProjectsAttributes>, ProjectsAttributes {
  dataValues: ProjectsAttributes
}
export class Projects extends Model<ProjectsModel, ProjectsAttributes> {}
export type ProjectsStatic = typeof Model & {
   new (values?: object, options?: BuildOptions): ProjectsModel;
};

export interface WorkersAttributes {
  id?: number;
  projectId: number;
  engineers?: number;         // مهندسين
  observers?: number;         // مراقبين
  trainedLabor?: number;      // عمالة مدربة
  labor?: number;             // عمالة عادية
  workDay: Date;
  updatedAt?: Date;
}
export interface WorkersModel extends Model<WorkersAttributes>, WorkersAttributes {}
export class Workers extends Model<WorkersModel, WorkersAttributes> {}
export type WorkersStatic = typeof Model & {
   new (values?: object, options?: BuildOptions): WorkersModel;
};

export interface TermsAttributes {
  id?: number;
  projectId: number;
  name: string;
  value: number;
  percentage: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface TermsModel extends Model<TermsAttributes>, TermsAttributes {}
export class Terms extends Model<TermsModel, TermsAttributes> {}
export type TermsStatic = typeof Model & {
   new (values?: object, options?: BuildOptions): TermsModel;
};

export interface TermlyAttributes {
  id?: number;
  projectId: number;
  termId: number;
  month: Date;
  type: string;           // الإنجاز المخطط -  الإنجاز المتحقق - الإنجاز المعتمد
  value: number;
}
export interface TermlyModel extends Model<TermlyAttributes>, TermlyAttributes {}
export class Termly extends Model<TermlyModel, TermlyAttributes> {}
export type TermlyStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): TermlyModel;
};


export interface DiariesAttributes {
  id?: number;
  projectId: number;
  planned?: number;
  achieved?: number;
  certified?: number;
  businessValue?: number;
  updatingStatus?: string;
  workDay: Date;
  updatedAt?: Date;
}
export interface DiariesModel extends Model<DiariesAttributes>, DiariesAttributes {}
export class Diaries extends Model<DiariesModel, DiariesAttributes> {}
export type DiariesStatic = typeof Model & {
   new (values?: object, options?: BuildOptions): DiariesModel;
};


export interface MonthlyAttributes {
  id?: number;
  projectId: number;
  status?: string;                 // الحالة الراهنة للمشروع
  plannedRatios?: number;         // النسب التراكمية في نهاية الشهر -  المخطط
  achievedRatios?: number;        // النسب التراكمية في نهاية الشهر -  الإنجاز
  certifiedRatios?: number;       // النسب التراكمية في نهاية الشهر -  المعتمد
  executedDeads?: number;         // إجمالي قيمة الأعمال المنفذة التراكمي
  paidToContractor?: number;      // قيمة المستخلصات التي تم صرفها للمقاول
  requestedOrders?: number;       // طلبات اعتماد المواد المقدمة
  certifiedOrders?: number;       // طلبات اعتماد المواد التراكمي
  month: Date;                    
  updatedAt?: Date;
}
export interface MonthlyModel extends Model<MonthlyAttributes>, MonthlyAttributes {}
export class Monthly extends Model<MonthlyModel, MonthlyAttributes> {}
export type MonthlyStatic = typeof Model & {
   new (values?: object, options?: BuildOptions): MonthlyModel;
};


export interface WeatherAttributes {
  id?: number;
  projectId: number;
  minDegree: number;      // درجة الحرارة الصغرى
  maxDegree?: number;     // درجة الحرارة العظمى
  status?: string;        // حالة الطقس
  workDay: Date;
}
export interface WeatherModel extends Model<WeatherAttributes>, WeatherAttributes {}
export class Weather extends Model<WeatherModel, WeatherAttributes> {}
export type WeatherStatic = typeof Model & {
   new (values?: object, options?: BuildOptions): WeatherModel;
};