-- Включаем публикацию изменений для Realtime (supabase_realtime)
-- для таблиц clients и messages

DO $$
BEGIN
  -- Добавляем clients в supabase_realtime публикацию, если еще не добавлена
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'clients'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
  END IF;

  -- Добавляем messages в supabase_realtime публикацию, если еще не добавлена
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
