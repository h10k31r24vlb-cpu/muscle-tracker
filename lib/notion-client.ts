/**
 * Notion API連携ヘルパー
 */

export interface NotionConfig {
  apiKey: string;
  logsDbId: string;
  sessionsDbId: string;
}

export interface WorkoutLog {
  date: string;
  menu: string;
  bodyPart: string;
  weight: number;
  reps: number;
}

export interface WorkoutSession {
  date: string;
  startTime: string;
  endTime: string;
  durationMin: number;
}

/**
 * Notion Logs DBにセット記録を送信
 */
export async function sendLogsToNotion(
  logs: WorkoutLog[],
  config: NotionConfig
): Promise<void> {
  const { apiKey, logsDbId } = config;

  for (const log of logs) {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: logsDbId },
        properties: {
          Log: {
            title: [
              {
                text: {
                  content: log.menu,
                },
              },
            ],
          },
          Menu: {
            select: {
              name: log.menu,
            },
          },
          BodyPart: {
            select: {
              name: log.bodyPart,
            },
          },
          Weight: {
            number: log.weight,
          },
          Reps: {
            number: log.reps,
          },
          Date: {
            date: {
              start: log.date,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send log to Notion: ${error}`);
    }
  }
}

/**
 * Notion Sessions DBにセッション情報を送信
 */
export async function sendSessionToNotion(
  session: WorkoutSession,
  config: NotionConfig
): Promise<void> {
  const { apiKey, sessionsDbId } = config;

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: sessionsDbId },
      properties: {
        Date: {
          title: [
            {
              text: {
                content: session.date,
              },
            },
          ],
        },
        StartTime: {
          date: {
            start: session.startTime,
          },
        },
        EndTime: {
          date: {
            start: session.endTime,
          },
        },
        DurationMin: {
          number: session.durationMin,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send session to Notion: ${error}`);
  }
}

/**
 * ワークアウトデータをNotionに一括送信
 */
export async function syncWorkoutToNotion(
  logs: WorkoutLog[],
  session: WorkoutSession,
  config: NotionConfig
): Promise<void> {
  // セッション情報を送信
  await sendSessionToNotion(session, config);
  
  // ログを送信
  await sendLogsToNotion(logs, config);
}
