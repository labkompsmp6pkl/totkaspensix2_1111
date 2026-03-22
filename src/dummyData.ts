import { Question, UserRole, User } from '../types';

export const dummyQuestions: Question[] = [
  {
    id: 'q1',
    subject: 'Matematika',
    text: 'Perhatikan grafik tarif ojek online berikut. Berapakah tarif untuk jarak 10 km?',
    type: 'single',
    points: 10,
    options: [
      { id: 'a', text: 'Rp 20.000', points: 10 },
      { id: 'b', text: 'Rp 25.000', points: 0 },
      { id: 'c', text: 'Rp 30.000', points: 0 },
      { id: 'd', text: 'Rp 35.000', points: 0 }
    ],
    correctOptionId: 'a',
    group_ids: [1],
    sort_order: 8,
    scoring_mode: 'all_or_nothing'
  },
  {
    id: 'q2',
    subject: 'Matematika',
    text: 'Sebuah bak mandi berbentuk kubus dengan panjang rusuk 80 cm. Jika bak tersebut diisi air hingga penuh, berapakah volume air dalam liter? (1 liter = 1.000 cm³)',
    type: 'single',
    points: 10,
    options: [
      { id: 'a', text: '512 liter', points: 10 },
      { id: 'b', text: '640 liter', points: 0 },
      { id: 'c', text: '800 liter', points: 0 },
      { id: 'd', text: '1.000 liter', points: 0 }
    ],
    correctOptionId: 'a',
    group_ids: [1],
    sort_order: 7,
    scoring_mode: 'all_or_nothing'
  },
  {
    id: 'q3',
    subject: 'Matematika',
    text: 'Hasil dari 25% + 0,5 - 1/4 adalah...',
    type: 'single',
    points: 10,
    options: [
      { id: 'a', text: '0,5', points: 10 },
      { id: 'b', text: '0,75', points: 0 },
      { id: 'c', text: '1,0', points: 0 },
      { id: 'd', text: '1,25', points: 0 }
    ],
    correctOptionId: 'a',
    group_ids: [],
    sort_order: 6,
    scoring_mode: 'all_or_nothing'
  }
];

export const dummyGroups = [
  {
    id: 1,
    group_name: 'UJIAN TENGAH SEMESTER',
    group_code: 'UTS-MAT-01',
    duration_minutes: 90,
    extra_time_minutes: 0,
    is_shuffled: 1,
    target_classes: ['9A', '9B', '9C'],
    last_started_at: '2026-03-21T08:00:00Z',
    teacher_ids: [JSON.stringify({ id: 't1', classes: ['9A', '9B'] })]
  },
  {
    id: 2,
    group_name: 'LATIHAN MANDIRI 1',
    group_code: 'LAT-01',
    duration_minutes: 60,
    extra_time_minutes: 15,
    is_shuffled: 0,
    target_classes: ['8U'],
    last_started_at: null,
    teacher_ids: []
  },
  {
    id: 3,
    group_name: 'TRY OUT AKHIR',
    group_code: 'TO-03',
    duration_minutes: 120,
    extra_time_minutes: 0,
    is_shuffled: 1,
    target_classes: ['9D', '9E', '9F'],
    last_started_at: '2026-03-21T12:00:00Z',
    teacher_ids: [JSON.stringify({ id: 't2', classes: ['9D'] })]
  }
];

export const dummyUsers: User[] = [
  { id: 't1', name: 'Budi Santoso', role: UserRole.TEACHER, username: 'budi', password: '123' },
  { id: 't2', name: 'Siti Aminah', role: UserRole.TEACHER, username: 'siti', password: '123' }
];
