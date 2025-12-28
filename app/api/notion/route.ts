import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { logs, session } = await request.json();

    const notionApiKey = process.env.NEXT_PUBLIC_NOTION_API_KEY;
    const logsDbId = process.env.NEXT_PUBLIC_NOTION_LOGS_DB_ID;
    const sessionsDbId = process.env.NEXT_PUBLIC_NOTION_SESSIONS_DB_ID;

    if (!notionApiKey || !logsDbId || !sessionsDbId) {
      return NextResponse.json(
        { error: 'Notion API credentials not configured' },
        { status: 500 }
      );
    }

    // セッション情報を送信
    const sessionResponse = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
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

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      console.error('Session error:', error);
      return NextResponse.json(
        { error: `Failed to send session: ${error}` },
        { status: 500 }
      );
    }

    // ログを送信
    for (const log of logs) {
      const logResponse = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionApiKey}`,
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

      if (!logResponse.ok) {
        const error = await logResponse.text();
        console.error('Log error:', error);
        return NextResponse.json(
          { error: `Failed to send log: ${error}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
