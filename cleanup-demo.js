import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dblqpqylmuslybhskjqv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibHFwcXlsbXVzbHliaHNranF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTc4NzIsImV4cCI6MjA2NzA5Mzg3Mn0.NCghO7c1Iy-lOsU6ntDYML2HDgLEv4aZj1SnwuIgibk";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function cleanupDemoUser() {
  console.log('🧹 Limpiando usuario demo y datos relacionados...');
  
  try {
    // Find demo user
    const { data: demoUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', 'demo_user')
      .single();
    
    if (userError) {
      console.log('✅ Usuario demo no encontrado o ya eliminado');
      return;
    }

    if (demoUser) {
      console.log('📋 Eliminando datos del usuario demo...');
      
      // Delete all related data
      const tables = [
        'stats',
        'cards', 
        'floating_cards',
        'daily_rewards',
        'daily_missions',
        'achievements',
        'shop_items',
        'rewards_wheel'
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', demoUser.id);
        
        if (error) {
          console.error(`❌ Error eliminando ${table}:`, error);
        } else {
          console.log(`✅ ${table} eliminado`);
        }
      }

      // Delete the user
      const { error: deleteUserError } = await supabase
        .from('users')
        .delete()
        .eq('id', demoUser.id);

      if (deleteUserError) {
        console.error('❌ Error eliminando usuario demo:', deleteUserError);
      } else {
        console.log('✅ Usuario demo eliminado exitosamente');
      }
    }

    console.log('🎉 Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

cleanupDemoUser(); 