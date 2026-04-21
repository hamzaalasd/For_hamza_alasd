export type Language = 'ar' | 'en';

export interface Project {
  id: string;
  slug: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  problem: { ar: string; en: string };
  techStack: string[];
  metrics: { label: { ar: string; en: string }; value: string }[];
  codeSnippet: string;
  architecture: string;
  type: 'web' | 'mobile' | 'fullstack';
  status: 'production' | 'development' | 'completed';
  githubUrl?: string;
  demoUrl?: string;
  images?: string[]; // صور المشروع
}

export interface Skill {
  id: string;
  name: string;
  category: 'backend' | 'frontend' | 'mobile' | 'devops' | 'architecture';
  level: number; // 0-100
  dependencies: string[]; // IDs of other skills
}

export interface Certification {
  id: string;
  issuer: string;
  title: { ar: string; en: string };
  date: string;
  verifyUrl: string;
  tech: string;
  imageUrl?: string; // URL صورة الشهادة للمعاينة
  credentialId?: string;
}

export interface Experience {
  id: string;
  company: { ar: string; en: string };
  role: { ar: string; en: string };
  startDate: string;
  endDate: string; // 'Present' or date
  description: { ar: string; en: string };
  technologies: string[];
}

export const projects: Project[] = [
  {
    id: '1',
    slug: 'edas',
    title: { ar: 'EDAS – نظام إدارة الأصول المؤسسي', en: 'EDAS – Enterprise Digital Asset System' },
    description: {
      ar: 'نظام مؤسسي متكامل لإدارة الأصول والموارد البشرية، يشمل إدارة المخزون والوثائق والعهد والحضور والمهام، مبني بـ Laravel 12 ومتكامل مع أجهزة البصمة.',
      en: 'A comprehensive enterprise system for managing assets, HR, and operations. Includes inventory, documents, custody, attendance (biometric integration), and tasks — built on Laravel 12.'
    },
    problem: {
      ar: 'كانت المؤسسة تعتمد على السجلات الورقية لتتبع الأصول والعهد مما أدى إلى فقدان البيانات وصعوبة التدقيق. قمت ببناء EDAS ليوحّد جميع العمليات في منصة واحدة بصلاحيات دقيقة وتقارير آنية.',
      en: 'The organization relied on paper records for asset tracking and custody management, leading to data loss and audit difficulties. EDAS was built to unify all operations under one platform with granular permissions and real-time reports.'
    },
    techStack: ['Laravel 12', 'TailwindCSS 4', 'Vite', 'MySQL', 'Blade', 'ZKTeco SDK', 'Sanctum'],
    metrics: [
      { label: { ar: 'وحدة وظيفية', en: 'Modules' }, value: '8+' },
      { label: { ar: 'نوع من الصلاحيات', en: 'Permission Types' }, value: '50+' },
      { label: { ar: 'جهاز بصمة متكامل', en: 'Biometric Devices' }, value: '5' }
    ],
    codeSnippet: `// نظام صلاحيات دقيق مبني على الأدوار
public function index(Request $request) {
    $this->authorize('documents.view');
    return Document::query()
        ->with(['category', 'signatures'])
        ->when($request->secret_level, fn($q, $level) => 
            $q->where('secret_level', $level)
        )
        ->paginate(20);
}`,
    architecture: 'Monolithic MVC + Service Layer + Role-Based Access Control',
    type: 'web',
    status: 'production'
  },
  {
    id: '2',
    slug: 'muzaraii',
    title: { ar: 'مزارعي – منصة الزراعة الذكية', en: 'Muzaraii – Smart Farming Platform' },
    description: {
      ar: 'تطبيق Flutter متكامل للمزارعين يوفر تتبع العمليات الزراعية، إدارة سلاسل القيمة، تقارير الأمراض والآفات، والتقويم الزراعي، مع دعم كامل للخرائط والموقع.',
      en: 'A full-featured Flutter app for farmers covering agricultural operations tracking, value chain management, disease/pest reports, agricultural calendar, and full map & GPS support.'
    },
    problem: {
      ar: 'المزارعون في المناطق النائية يفتقرون لأدوات رقمية تدعم عملياتهم اليومية وتربطهم بالجهات الداعمة. تطبيق مزارعي يحل ذلك بواجهة عربية سلسة وتكامل مع Laravel backend.',
      en: 'Farmers in remote areas lack digital tools to support daily operations and connect them to support organizations. Muzaraii solves this with a smooth Arabic interface and Laravel backend integration.'
    },
    techStack: ['Flutter', 'Dart', 'Laravel API', 'Google Fonts', 'Geolocator', 'Provider', 'HTTP', 'Riverpod'],
    metrics: [
      { label: { ar: 'شاشة في التطبيق', en: 'App Screens' }, value: '20+' },
      { label: { ar: 'نوع محصول مدعوم', en: 'Crop Types' }, value: '15+' },
      { label: { ar: 'منصة مدعومة', en: 'Platforms' }, value: 'Android & iOS' }
    ],
    codeSnippet: `// تتبع الموقع الجغرافي بدقة عالية
StreamSubscription<Position> _positionStream = 
  Geolocator.getPositionStream(
    locationSettings: const LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 10,
    ),
  ).listen((Position position) {
    context.read<FarmProvider>().updateLocation(position);
  });`,
    architecture: 'Flutter + Provider/Riverpod + REST API',
    type: 'mobile',
    status: 'production'
  },
  {
    id: '3',
    slug: 'edas-employee-app',
    title: { ar: 'تطبيق EDAS للموظفين', en: 'EDAS Employee App' },
    description: {
      ar: 'تطبيق Flutter احترافي للموظفين يتكامل مع نظام EDAS، يعمل بدون إنترنت (Offline-First) ويتيح إدارة المهام والعهد والحضور ومسح الباركود وطباعة التقارير.',
      en: 'A professional Flutter app for employees integrating with the EDAS system. Features offline-first architecture, task management, custody tracking, attendance, barcode scanning, and PDF report printing.'
    },
    problem: {
      ar: 'الموظفون في الميدان يحتاجون للوصول إلى بياناتهم حتى بدون إنترنت. بنيت تطبيق EDAS بمعمارية Offline-First باستخدام Hive وMobileScanner لضمان الاستمرارية في أي بيئة.',
      en: 'Field employees need data access even without internet connectivity. EDAS Employee App is built with an Offline-First architecture using Hive and MobileScanner to ensure continuity in any environment.'
    },
    techStack: ['Flutter', 'Riverpod', 'BLoC', 'Hive', 'Dio', 'mobile_scanner', 'PDF', 'Hijri'],
    metrics: [
      { label: { ar: 'وضع Offline', en: 'Offline Support' }, value: '✓ Full' },
      { label: { ar: 'نوع من الأذونات', en: 'Access Modes' }, value: '3 Types' },
      { label: { ar: 'تكامل API', en: 'API Endpoints' }, value: '15+' }
    ],
    codeSnippet: `// Offline-First Architecture with Hive
class TaskRepository {
  final TaskRemoteDS _remote;
  final Box<TaskHiveModel> _cache;

  Future<List<Task>> getTasks() async {
    if (await _connectivity.isOnline) {
      final tasks = await _remote.fetchTasks();
      await _cache.putAll(tasks.toHiveMap());
      return tasks;
    }
    return _cache.values.map((e) => e.toEntity()).toList();
  }
}`,
    architecture: 'Clean Architecture + Riverpod + Offline-First (Hive)',
    type: 'mobile',
    status: 'production'
  },
  {
    id: '4',
    slug: 'farmer-offline',
    title: { ar: 'تطبيق المسح الزراعي الميداني', en: 'Agricultural Field Survey App' },
    description: {
      ar: 'تطبيق Flutter متخصص لجامعي البيانات الزراعية في الحقل، يعمل بدون إنترنت مع مزامنة تلقائية عند الاتصال. يتضمن خرائط تفاعلية وأشكال هندسية للأراضي ونماذج استبيان ذكية.',
      en: 'A specialized Flutter app for agricultural data collectors in the field. Works offline with automatic sync when connected, featuring interactive maps, land geometry tools, and smart survey forms.'
    },
    problem: {
      ar: 'جامعو البيانات في الحقول النائية لا يستطيعون إدخال بياناتهم بسبب انعدام الإنترنت. قمت ببناء تطبيق يخزن كل شيء محلياً في SQLite ويزامن تلقائياً عند الاتصال باستخدام WorkManager.',
      en: 'Data collectors in remote fields cannot submit data due to lack of internet. Built an app that stores everything locally in SQLite (via Drift) and auto-syncs when connected using WorkManager.'
    },
    techStack: ['Flutter', 'Drift (SQLite)', 'WorkManager', 'flutter_map', 'Riverpod', 'Hive', 'local_auth', 'fl_chart'],
    metrics: [
      { label: { ar: 'قاعدة بيانات محلية', en: 'Local DB Engine' }, value: 'Drift/SQLite' },
      { label: { ar: 'مزامنة خلفية', en: 'Background Sync' }, value: 'WorkManager' },
      { label: { ar: 'خرائط تفاعلية', en: 'Interactive Maps' }, value: 'OSM + GPS' }
    ],
    codeSnippet: `// Background Sync with WorkManager
@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    final db = await DriftDatabase.open();
    final pendingRecords = await db.getPendingSync();
    for (final record in pendingRecords) {
      await ApiService.upload(record);
      await db.markSynced(record.id);
    }
    return Future.value(true);
  });
}`,
    architecture: 'Flutter + Drift ORM + Offline-First + Background Sync',
    type: 'mobile',
    status: 'completed'
  },
  {
    id: '5',
    slug: 'survey-system',
    title: { ar: 'منصة إدارة الاستبيانات الزراعية', en: 'Agricultural Survey Management System' },
    description: {
      ar: 'نظام ويب Laravel متكامل لإنشاء وإدارة الاستبيانات الزراعية، يدعم التحكم في مستويات الوصول (ويب / موبايل / كلاهما) مع حماية متقدمة ونشر آمن للاستبيانات.',
      en: 'A full Laravel web system for creating and managing agricultural surveys. Supports granular access control (web/mobile/both), advanced security, and controlled survey publication.'
    },
    problem: {
      ar: 'كانت عملية إدارة الاستبيانات تدوية وعرضة للأخطاء. قمت ببناء منصة آمنة تتحكم في من يملأ الاستبيان (ويب أو موبايل) وتمنع الوصول غير المصرح به.',
      en: 'Survey management was manual and error-prone. Built a secure platform controlling who fills surveys (web or mobile) and preventing unauthorized access with a robust middleware layer.'
    },
    techStack: ['Laravel', 'Vue.js', 'Inertia.js', 'TailwindCSS', 'MySQL', 'Sanctum API'],
    metrics: [
      { label: { ar: 'نوع وصول مستخدم', en: 'User Access Types' }, value: '3 Types' },
      { label: { ar: 'حماية مزدوجة', en: 'Dual Protection' }, value: 'Web + API' },
      { label: { ar: 'نشر آمن', en: 'Secure Publishing' }, value: 'Lock System' }
    ],
    codeSnippet: `// Middleware لتحديد نوع الوصول
class CheckAccessType {
  public function handle(Request $request, Closure $next, string $type) {
    $user = $request->user();
    if ($type === 'web' && $user->access_type === 'mobile_only') {
      return response()->json(['error' => 'Web access not allowed'], 403);
    }
    return $next($request);
  }
}`,
    architecture: 'Laravel MVC + Inertia.js SPA + API Dual-Access',
    type: 'fullstack',
    status: 'completed'
  }
];

export const skills: Skill[] = [
  { id: 'laravel', name: 'Laravel', category: 'backend', level: 95, dependencies: ['php', 'mysql'] },
  { id: 'php', name: 'PHP', category: 'backend', level: 98, dependencies: [] },
  { id: 'mysql', name: 'MySQL', category: 'backend', level: 90, dependencies: [] },
  { id: 'vue', name: 'Vue.js', category: 'frontend', level: 85, dependencies: ['javascript'] },
  { id: 'javascript', name: 'JavaScript', category: 'frontend', level: 88, dependencies: [] },
  { id: 'flutter', name: 'Flutter', category: 'mobile', level: 90, dependencies: ['dart'] },
  { id: 'dart', name: 'Dart', category: 'mobile', level: 88, dependencies: [] },
  { id: 'riverpod', name: 'Riverpod', category: 'mobile', level: 85, dependencies: ['dart', 'flutter'] },
  { id: 'hive', name: 'Hive / Drift', category: 'mobile', level: 82, dependencies: ['dart'] },
  { id: 'sanctum', name: 'Laravel Sanctum', category: 'backend', level: 92, dependencies: ['laravel'] },
  { id: 'tailwind', name: 'TailwindCSS', category: 'frontend', level: 90, dependencies: ['javascript'] },
  { id: 'linux', name: 'Linux', category: 'devops', level: 80, dependencies: [] },
  { id: 'architecture', name: 'System Design', category: 'architecture', level: 92, dependencies: ['laravel', 'flutter'] },
];

export const certifications: Certification[] = [
  {
    id: 'c1',
    issuer: 'Udemy',
    title: { ar: 'Laravel: من المبتدئ إلى الاحترافي', en: 'Laravel: From Beginner to Professional' },
    date: '2024-06-10',
    verifyUrl: 'https://www.udemy.com',
    tech: 'Laravel',
    credentialId: 'UC-LARAVEL-2024'
  },
  {
    id: 'c2',
    issuer: 'Udemy',
    title: { ar: 'تطوير تطبيقات Flutter الاحترافية', en: 'Professional Flutter App Development' },
    date: '2024-09-20',
    verifyUrl: 'https://www.udemy.com',
    tech: 'Flutter',
    credentialId: 'UC-FLUTTER-2024'
  },
  {
    id: 'c3',
    issuer: 'Coursera',
    title: { ar: 'تصميم قواعد البيانات وSQL المتقدم', en: 'Database Design & Advanced SQL' },
    date: '2023-11-15',
    verifyUrl: 'https://www.coursera.org',
    tech: 'MySQL',
    credentialId: 'CRS-SQL-2023'
  },
  {
    id: 'c4',
    issuer: 'LinkedIn Learning',
    title: { ar: 'معمارية الأنظمة وتصميم البنية التحتية', en: 'System Architecture & Infrastructure Design' },
    date: '2025-01-05',
    verifyUrl: 'https://www.linkedin.com/learning',
    tech: 'Architecture',
    credentialId: 'LI-ARCH-2025'
  }
];
