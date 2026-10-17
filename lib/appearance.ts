export type Appearance='light'|'dark'|'system';
export const APPEARANCE_KEY='adib.studio.appearance';
export function parseAppearance(value:unknown):Appearance{return value==='light'||value==='dark'?value:'system';}
export function resolveAppearance(value:Appearance,prefersDark:boolean):'light'|'dark'{return value==='system'?(prefersDark?'dark':'light'):value;}
export const APPEARANCE_BOOT=`(function(){var t='system';try{var s=localStorage.getItem('adib.studio.appearance');if(s==='light'||s==='dark')t=s}catch(e){}var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.dataset.appearance=t;document.documentElement.style.colorScheme=d?'dark':'light'})()`;
