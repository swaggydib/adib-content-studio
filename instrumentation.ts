export async function register(){if(process.env.NEXT_RUNTIME==='nodejs'){const {getIntegrations}=await import('./lib/integrations');getIntegrations().scanInbox(true);}}
