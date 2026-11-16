/* Little Egg — the pet's inner life: personality, voice, keepsakes, the 7-day moments and letters.
   Text only, so it's easy to edit. Every line has a Burmese (my) and English (en) version.
   In lines you can use: {name} = pet's name, {you} = what the pet calls the player, {snd} = the pet's sound (mew, woof…).
   Add new keepsakes only at the END of KEEP (saves store their ids). */
(function(){

/* ---------- personalities ---------- */
const TRAITS={
  foodie: {e:'🍡', my:'စားကြူးလေး', en:'Foodie',
    myD:'စားရတာ အပျော်ဆုံး။ မုန့်ကျွေးရင် ပိုပျော်တယ်။', enD:'Loves food more than anything. Snacks make it extra happy.'},
  playful:{e:'🎾', my:'ဆော့သန်လေး', en:'Playful',
    myD:'ဆော့ရတာ အကြိုက်ဆုံး။ ကစားရင် ပိုပျော်တယ်။', enD:'Lives to play. Games make it extra happy.'},
  cuddly: {e:'💗', my:'ချွဲလေး', en:'Cuddly',
    myD:'ချော့တာ အကြိုက်ဆုံး။ ချော့ရင် ပိုပျော်တယ်။', enD:'Loves being petted. Petting makes it extra happy.'},
  tidy:   {e:'🫧', my:'သန့်ရှင်းကြိုက်လေး', en:'Tidy',
    myD:'သန့်သန့်ရှင်းရှင်း နေချင်တယ်။ ရေချိုးပေးရင် ပိုပျော်တယ်။', enD:'Likes to be neat. Cleaning makes it extra happy.'},
  sleepy: {e:'🌙', my:'အိပ်ပုတ်လေး', en:'Sleepy',
    myD:'အိပ်ရတာ အပျော်ဆုံး။ နေ့လယ်အိပ်ရင် ပိုပျော်တယ်။', enD:'A champion napper. Naps make it extra happy.'},
  shy:    {e:'🌷', my:'ရှက်တတ်လေး', en:'Shy',
    myD:'တိတ်တိတ်လေး နေတတ်တယ်။ အချိန်ပေးပြီး ချော့ရင် ရင်းနှီးလာမယ်။', enD:'Quiet and gentle. Warms up slowly with a little petting.'}
};

/* the pet's own sound, by animal */
const SND={cat:{my:'မြောင်',en:'Mew'},dog:{my:'ဝုတ်',en:'Woof'},bird:{my:'ချစ်ချစ်',en:'Tweet'},owl:{my:'ဟွတ်',en:'Hoo'},
  gecko:{my:'တောက်',en:'Tchk'},chameleon:{my:'ရှီး',en:'Hss'},turtle:{my:'ဟင်း',en:'Hmm'},hedgehog:{my:'ဖွီ',en:'Snff'}};
function sndKind(id){ if(id.startsWith('cat_')) return 'cat'; if(id.startsWith('dog_')) return 'dog'; if(id==='parrot'||id==='myna') return 'bird'; return SND[id]?id:'cat'; }

/* ---------- keepsakes (gifts the pet brings) ---------- r: 0 common, 1 rare, 2 special */
const KEEP=[
  {id:'feather',e:'🪶',r:0,my:'ငှက်မွေးလေး',en:'Feather'},
  {id:'shell',e:'🐚',r:0,my:'ခရုခွံ',en:'Seashell'},
  {id:'leaf',e:'🍂',r:0,my:'ရွက်ခြောက်',en:'Crunchy leaf'},
  {id:'flower',e:'🌼',r:0,my:'ပန်းပွင့်လေး',en:'Little flower'},
  {id:'pebble',e:'🪨',r:0,my:'ချောချောကျောက်စရစ်',en:'Smooth pebble'},
  {id:'button',e:'🔘',r:0,my:'ကြယ်သီး',en:'Button'},
  {id:'sock',e:'🧦',r:0,my:'ခြေအိတ် တစ်ဖက်',en:'One lost sock'},
  {id:'ribbon',e:'🎀',r:0,my:'ဖဲကြိုး',en:'Ribbon'},
  {id:'yarn',e:'🧶',r:0,my:'ချည်ခင်လုံး',en:'Ball of yarn'},
  {id:'sticker',e:'⭐',r:0,my:'ကြယ်စတစ်ကာ',en:'Star sticker'},
  {id:'coin',e:'🪙',r:1,my:'အကြွေစေ့ ဟောင်း',en:'Old coin'},
  {id:'marble',e:'🔮',r:1,my:'ဂေါ်လီလုံး',en:'Marble'},
  {id:'puzzle',e:'🧩',r:1,my:'ပဟေဠိ အပိုင်းလေး',en:'Puzzle piece'},
  {id:'lotus',e:'🪷',r:1,my:'ကြာပန်း',en:'Lotus'},
  {id:'key',e:'🔑',r:2,my:'ရွှေသော့လေး',en:'Tiny golden key'},
  {id:'gem',e:'💎',r:2,my:'တောက်တောက် ကျောက်လေး',en:'Sparkly gem'}
];

/* ---------- what the pet can call you (chosen at its first word) ---------- */
const CALLS={my:['အမေ','အဖေ','အစ်ကို','အစ်မ','သူငယ်ချင်း'],en:['Mom','Dad','Big bro','Big sis','Buddy']};
const CALL_DEFAULT={my:'သူငယ်ချင်း',en:'friend'};

/* ---------- lines ----------
   L[situation] = {my:[...], en:[...], baby:{my,en}, foodie:{my,en}, ...}
   Babies only use their baby lines (they can't talk much yet). Trait lines are picked more often once it has a personality. */
const L={
  morning:{my:['မင်္ဂလာနံနက်ခင်းပါ {you}!','မနက်ပြီ! ဒီနေ့ ဘာလုပ်ကြမလဲ?','{you} နိုးပြီလား? ငါ စောင့်နေတာ။'],
           en:['Good morning, {you}!','It\'s morning! What shall we do today?','You\'re up! I was waiting for you.'],
           baby:{my:['{snd}… {snd}!','မ… မနက်…'],en:['{snd}… {snd}!','Mo… morning…']},
           foodie:{my:['မနက်စာ ဘာစားရမလဲ? ☺'],en:['What\'s for breakfast? ☺']},
           sleepy:{my:['အား… နောက်ထပ် ငါးမိနစ်လောက် အိပ်ချင်သေး…'],en:['Five more minutes… *yawn*']},
           playful:{my:['မနက်ပြီ! ဆော့ကြမယ်! ဆော့ကြမယ်!'],en:['Morning! Let\'s play! Let\'s play!']}},
  noon:{my:['{you} ပြန်လာပြီ!','ဟိုင်း {you}!','နေ့လယ်ကြီး ဘာလုပ်နေလဲ?'],
        en:['{you} is back!','Hi {you}!','What are you up to this afternoon?'],
        baby:{my:['{snd}!','ဟီး…'],en:['{snd}!','Hee…']},
        shy:{my:['…ဟိုင်း {you}။'],en:['…hi, {you}.']},
        cuddly:{my:['လာ… ချော့ပါဦး။'],en:['Come here… pet me?']}},
  evening:{my:['ညနေခင်းလေး သာယာတယ်နော်။','{you} ဒီနေ့ ပင်ပန်းလား?','ညနေပြီ… မကြာခင် အိပ်ချိန်ရောက်တော့မယ်။'],
           en:['Such a nice evening.','Long day, {you}?','Evening already… bedtime soon.'],
           baby:{my:['{snd}… ☺'],en:['{snd}… ☺']},
           sleepy:{my:['အိပ်ချိန် ရောက်ပြီလား? ရောက်ပြီလား?'],en:['Is it bedtime yet? Is it?']}},
  hungry:{my:['ဗိုက်ဆာတယ်…','{you}… ထမင်း…','ဗိုက်ထဲမှာ ဂူးဂူး မြည်နေပြီ။'],
          en:['I\'m hungry…','{you}… food…','My tummy is rumbling.'],
          baby:{my:['ဗိုက်… ဗိုက်…','{snd}! ထမင်း!'],en:['Tum… tummy…','{snd}! Food!']},
          foodie:{my:['ထမင်းနံ့ ရနေတယ်… မဟုတ်ဘူးလား? 🍚','စားချင်တယ် စားချင်တယ် စားချင်တယ်!'],en:['I can smell rice… can\'t I? 🍚','Food food food!']}},
  dirty:{my:['ယားလာပြီ…','ရေချိုးချင်ပြီ။','ဒီနားက အနံ့… ငါ့ဆီကလား? 😳'],
         en:['I feel itchy…','Bath time, maybe?','That smell… is it me? 😳'],
         baby:{my:['အီး…'],en:['Ew…']},
         tidy:{my:['ညစ်ပတ်နေတာ မကြိုက်ဘူး! ရေချိုးပေးပါ!'],en:['I can\'t stand being messy! Bath, please!']}},
  sad:{my:['ပျင်းလိုက်တာ…','ငါနဲ့ ဆော့ပါဦး…','{you} ငါ့ကို မေ့သွားပြီလား?'],
       en:['So bored…','Play with me?','Did you forget about me, {you}?'],
       baby:{my:['အဲ… အဲ…'],en:['Waaah…']},
       playful:{my:['ဘောလုံး… ဘောလုံး ဘယ်မှာလဲ? 🎾'],en:['Ball… where\'s the ball? 🎾']},
       shy:{my:['…ငါ ဒီမှာ ရှိသေးတယ်နော်။'],en:['…I\'m still here, you know.']}},
  sick:{my:['နေမကောင်းဘူး…','ခေါင်းမူးနေတယ်…','ဆေးလေး… ပေးပါဦး…'],
        en:['I don\'t feel well…','My head is spinning…','Medicine… please…'],
        baby:{my:['အင်း… 🤒'],en:['Mmm… 🤒']}},
  tired:{my:['မျက်လုံး လေးလာပြီ…','ခဏ အိပ်ချင်တယ်။'],en:['My eyes are heavy…','Can I nap a little?'],
         baby:{my:['အား…'],en:['*yawn*']},
         sleepy:{my:['အိပ်ရာ… အိပ်ရာ… ဘယ်မှာလဲ…'],en:['Bed… bed… where\'s my bed…']}},
  ate:{my:['ဝသွားပြီ! ကျေးဇူးပဲ {you}!','အရသာရှိလိုက်တာ!','ဗိုက်လေး ပြည့်သွားပြီ ☺'],
       en:['So full! Thank you, {you}!','That was yummy!','Happy tummy ☺'],
       baby:{my:['{snd}! ☺','ဝ… ဝ!'],en:['{snd}! ☺','Yum… yum!']},
       foodie:{my:['ဒါ ဘဝမှာ အကောင်းဆုံး ထမင်းပဲ!','နောက်တစ်ပန်းကန် ရဦးမလား? 😋'],en:['Best meal of my life!','Is there seconds? 😋']}},
  snack:{my:['မုန့်! ချစ်တယ်!','ချိုချိုလေး ☺','နောက်တစ်ခု ရဦးမလား?'],
         en:['Snack! I love you!','Sweet! ☺','Can I have another one?'],
         baby:{my:['မုန့်! {snd}!'],en:['Snack! {snd}!']},
         foodie:{my:['မုန့်က ငါ့အတွက် ဆေးပဲ! 😋'],en:['Snacks are my medicine! 😋']}},
  full:{my:['ဝလွန်းနေပြီ… မစားနိုင်တော့ဘူး။','ဗိုက်ပေါက်တော့မယ်!'],en:['Too full… can\'t eat another bite.','My tummy will pop!'],
        baby:{my:['အင်းအင်း!'],en:['Nuh-uh!']},
        foodie:{my:['…ဗိုက်ပြည့်နေပေမယ့် မုန့်ဆိုရင်တော့ စားနိုင်သေးတယ်။'],en:['…I\'m full, but there\'s always room for a snack.']}},
  cleaned:{my:['သန့်သွားပြီ! မွှေးမွှေးလေး ✨','ဘယ်လိုလဲ? ငါ ချစ်စရာ ကောင်းလား?'],en:['All clean! I smell nice ✨','How do I look? Cute?'],
           baby:{my:['ဗွက်… ဗွက်… ☺'],en:['Splish… splash… ☺']},
           tidy:{my:['အဲဒါပဲ! ဒီလိုမှ ငါပေါ့! ✨'],en:['That\'s more like it! ✨']}},
  med:{my:['နေကောင်းလာပြီ… ကျေးဇူးပဲ။','ခါးတယ်… ဒါပေမဲ့ ပိုကောင်းလာပြီ။'],en:['Feeling better… thanks.','Bitter… but I feel better.'],
       baby:{my:['ခါး… 😖'],en:['Bitter… 😖']}},
  petted:{my:['ဟီး ☺','{you} လက်လေး နွေးတယ်။','ထပ်ချော့ပါဦး!'],en:['Hee ☺','Your hands are warm, {you}.','Again!'],
          baby:{my:['{snd} ☺'],en:['{snd} ☺']},
          cuddly:{my:['အဲဒီနေရာ! အဲဒီနေရာ! 💗','တစ်နေကုန် ချော့ပေးလို့ ရလား?'],en:['Right there! Right there! 💗','Can you do this all day?']},
          shy:{my:['…ဟီး။ နည်းနည်း ရှက်တယ်။'],en:['…hee. That tickles.']}},
  playGood:{my:['အရမ်းပျော်တာပဲ! နောက်တစ်ပွဲ!','ငါ တော်တယ်မလား?'],en:['That was so fun! Again!','Am I good or what?'],
            baby:{my:['{snd}! {snd}! ☺'],en:['{snd}! {snd}! ☺']},
            playful:{my:['ငါ ကမ္ဘာ့ ချန်ပီယံ! 🏆'],en:['World champion! 🏆']}},
  playBad:{my:['ဟင်း… နောက်တစ်ခါ ပိုတော်မယ်။','ကျော့သွားတယ်… ဒါပေမဲ့ ပျော်တယ်။'],en:['Hmm… I\'ll do better next time.','I missed a lot… but it was fun.'],
           baby:{my:['{snd}…'],en:['{snd}…']}},
  woke:{my:['အိပ်ပျော်သွားတာ… ကောင်းလိုက်တာ။','နိုးပြီ! ☀️'],en:['What a lovely nap.','I\'m awake! ☀️'],
        baby:{my:['အား… ☺'],en:['*yawn* ☺']},
        sleepy:{my:['အား… အိပ်လို့ မဝသေးဘူး…'],en:['Already? I could sleep more…']}},
  sleeptalk:{my:['ဇ… ဇ… ငါး… ကြီး…','အင်း… မုန့်… မုန့်…','ဇ… {you}…'],en:['Zz… big… fish…','Mm… snacks… snacks…','Zz… {you}…'],
             baby:{my:['ဇ… ☺'],en:['Zz… ☺']}},
  idle:{my:['ဒီနေ့ ကောင်းကင် ဘယ်လိုလဲ?','{you} ဒီမှာ ရှိနေတာ ပျော်တယ်။','ငါ ဘာ စဉ်းစားနေလဲ သိလား? မုန့်အကြောင်း။','လမ်းလျှောက်နေတာ… ဒီဘက်… ဟိုဘက်…','{you} နဲ့ အတူရှိရတာ ကောင်းတယ်။'],
        en:['I wonder what the sky looks like today.','I\'m happy you\'re here, {you}.','Know what I\'m thinking about? Snacks.','Walking… this way… that way…','I like being with you, {you}.'],
        baby:{my:['{snd}?','ဟီး…','{snd}! {snd}!'],en:['{snd}?','Hee…','{snd}! {snd}!']},
        foodie:{my:['ငါ့ ပန်းကန်လေး ဗလာ ဖြစ်နေသလား စစ်ကြည့်နေတာ။','ထမင်းနဲ့ မုန့် ဘယ်ဟာ ပိုကြိုက်လဲ? …နှစ်ခုလုံး!'],en:['Just checking if my bowl is empty.','Rice or snacks? …Both!']},
        playful:{my:['ဆော့ကြမလား? ဆော့ကြမလား?','ငါ ခုန်တာ ကြည့်! ⭐'],en:['Wanna play? Wanna play?','Watch me jump! ⭐']},
        cuddly:{my:['{you} ကို ချစ်တယ် 💗','ဖက်ပေးပါဦး…'],en:['I love you, {you} 💗','Hug?']},
        tidy:{my:['ငါ့ အမွေးလေး သေသပ်နေလား?','ဒီနားမှာ ဖုန်ရှိနေသလား…?'],en:['Is my fur neat?','Is that dust over there…?']},
        sleepy:{my:['အား… ☁️','ခဏလေး မှေးမယ်နော်…'],en:['*yawn* ☁️','Just resting my eyes…']},
        shy:{my:['…','{you}… ဟိုလေ… ဘာမှ မဟုတ်ပါဘူး။'],en:['…','{you}… um… never mind.']}},
  /* when two pets meet (visit link / playdate) — no {you} here: the listener is another pet or a visitor */
  meet:{my:['ဟိုင်း! ငါတို့ သူငယ်ချင်း လုပ်ကြမလား?','မင်္ဂလာပါ! တွေ့ရတာ ဝမ်းသာတယ်!','လာလည်ရတာ ပျော်တယ်!'],en:['Hi! Want to be friends?','Hello! Nice to meet you!','So happy to visit!'],
        baby:{my:['{snd}! {snd}!','ဟီး… {snd}?'],en:['{snd}! {snd}!','Hee… {snd}?']},
        shy:{my:['…ဟိုင်း။'],en:['…hi.']},playful:{my:['ဆော့ကြမယ်! ဆော့ကြမယ်!'],en:['Let\'s play! Let\'s play!']},foodie:{my:['ဟိုင်း! မုန့် ပါလာလား? 😋'],en:['Hi! Did you bring snacks? 😋']}},
  pdBall:{my:['ဖမ်းထား!','ငါ့အလှည့်! ငါ့အလှည့်!','ကောင်းတယ်!'],en:['Catch!','My turn! My turn!','Nice one!'],
          baby:{my:['{snd}!'],en:['{snd}!']}},
  pdSnack:{my:['တစ်ဝက်စီ စားကြမယ်နော်။','အတူတူစားတော့ ပိုအရသာရှိတယ်!'],en:['Half each, okay?','Tastes better together!'],
           baby:{my:['မုန့်! {snd}!'],en:['Snack! {snd}!']},
           foodie:{my:['…ငါ့ဘက်က နည်းနည်း ပိုကြီးတာ ယူမယ်နော် 😋'],en:['…I\'ll take the slightly bigger half 😋']}},
  bye:{my:['နောက်လည်း လာလည်မယ်နော်!','တာ့တာ! 👋','ဒီနေ့ အရမ်းပျော်တယ်!'],en:['I\'ll come again soon!','Bye-bye! 👋','Today was so fun!'],
       baby:{my:['{snd}… 👋'],en:['{snd}… 👋']}},
  gift:{my:['ရော့! {you} အတွက်!','ဒါလေး တွေ့ခဲ့တယ်… ယူပါ!'],en:['Here! For you, {you}!','I found this… it\'s yours!'],
        shy:{my:['…ဒါလေး… {you} အတွက်။'],en:['…this… is for you.']}}
};

/* ---------- 7-day moments ---------- */
const MOMENTS=[
  {k:'word',day:1},   // child: first word + what it calls you
  {k:'gift',day:2},   // first gift (then about one a day while happy)
  {k:'trait',day:3},  // teen: personality revealed
  {k:'trick',day:4},  // learns a trick
  {k:'letter',day:5}, // writes you a letter
  {k:'dream',day:6}   // talks about its dream
];
/* letters, dreams and the grown-up note, by personality */
const LETTER={
  foodie:{my:'{you} ရေ…\nငါ မနေ့က ထမင်းကို စဉ်းစားနေတာ။ ပြီးတော့ {you} ကို စဉ်းစားမိတယ်။ ထမင်းထက် {you} ကို ပိုချစ်တယ်… နည်းနည်းလေး။\n— {name} 🍡',
          en:'Dear {you},\nI was thinking about rice yesterday. Then I thought about you. I love you more than rice… just a tiny bit more.\n— {name} 🍡'},
  playful:{my:'{you} ရေ…\nငါ ခုန်တာ ကြည့်ခဲ့လား? {you} အတွက် ခုန်တာ။ မနက်ဖြန်လည်း ဆော့ကြမယ်နော်။ ကတိ!\n— {name} 🎾',
           en:'Dear {you},\nDid you see me jump? That was for you. Let\'s play tomorrow too. Promise!\n— {name} 🎾'},
  cuddly:{my:'{you} ရေ…\n{you} ချော့တိုင်း ရင်ထဲမှာ နွေးနွေးလေး ဖြစ်သွားတယ်။ ဒီလိုပဲ အမြဲ နေကြမယ်နော်။\n— {name} 💗',
          en:'Dear {you},\nEvery time you pet me, my heart gets warm and fuzzy. Let\'s always be like this.\n— {name} 💗'},
  tidy:{my:'{you} ရေ…\nငါ့ အမွေးတွေ သေသေသပ်သပ် ဖြီးထားတယ်။ {you} မြင်ရင် ပျော်မယ်ထင်လို့။ ကျေးဇူးပဲ ရေချိုးပေးလို့။\n— {name} 🫧',
        en:'Dear {you},\nI combed my fur extra neat today, because I thought you\'d like it. Thank you for all the baths.\n— {name} 🫧'},
  sleepy:{my:'{you} ရေ…\nအိပ်မက်ထဲမှာ {you} လည်း ပါတယ်။ ငါတို့ တိမ်တွေပေါ်မှာ အတူ အိပ်နေကြတာ။ အရမ်း သက်တောင့်သက်သာ ရှိတယ်။\n— {name} 🌙',
          en:'Dear {you},\nYou were in my dream. We were napping on a cloud together. It was very comfy.\n— {name} 🌙'},
  shy:{my:'{you} ရေ…\nငါ စကား သိပ်မပြောတတ်ဘူး။ ဒါပေမဲ့ {you} ရှိနေတာ ငါ အရမ်း ပျော်တယ်။ ဒါပဲ… ပြောချင်တာ။\n— {name} 🌷',
       en:'Dear {you},\nI\'m not very good at saying things. But I\'m really happy you\'re here. That\'s all… I wanted to say.\n— {name} 🌷'}
};
const DREAM={
  foodie:{my:'ထမင်းတောင်ကြီး တစ်လုံး! ငါ အပေါ်ဆုံးကနေ စစားတာ။',en:'A mountain of rice! I started eating from the top.'},
  playful:{my:'ငါ လေထဲမှာ ပျံနေတာ! ကြယ်တွေကို လိုက်ဖမ်းနေတာ။',en:'I was flying! Chasing stars across the sky.'},
  cuddly:{my:'{you} နဲ့ ငါ စောင်ထူထူလေးထဲမှာ ကွေးနေကြတာ။',en:'You and me, curled up under a big fluffy blanket.'},
  tidy:{my:'ပူဖောင်းတွေ အများကြီး! ကမ္ဘာကြီး တစ်ခုလုံး မွှေးမွှေးလေး။',en:'Bubbles everywhere! The whole world smelled like soap.'},
  sleepy:{my:'အိပ်မက်ထဲမှာလည်း ငါ အိပ်နေတာ။ အရမ်းကောင်းတယ်။',en:'I dreamed I was sleeping. It was wonderful.'},
  shy:{my:'ငါ သီချင်းဆိုနေတာ… လူတိုင်း လက်ခုပ်တီးကြတယ်။ ငါ မရှက်ဘူး။',en:'I was singing… and everyone clapped. I wasn\'t shy at all.'}
};
const GROWN={
  foodie:{my:'{you} ရေ၊ ငါ ကြီးပြီ! ဒါပေမဲ့ မုန့်ကို ချစ်တာ မပြောင်းဘူးနော်။ ကျွေးမွေးပေးခဲ့လို့ ကျေးဇူးပါ။',en:'{you}, I\'m all grown up! But I still love snacks, okay? Thank you for feeding me so well.'},
  playful:{my:'{you} ရေ၊ ငါ ကြီးပြီ! ဒါပေမဲ့ ဆော့ချင်တာကတော့ ကလေးတုန်းကအတိုင်းပဲ။ အတူ ဆော့ပေးခဲ့လို့ ကျေးဇူး!',en:'{you}, I\'m grown up! But I still want to play like a kid. Thanks for all the games!'},
  cuddly:{my:'{you} ရေ၊ ငါ ကြီးပြီ။ ဒါပေမဲ့ ချော့ပေးရင် ကလေးလိုပဲ ဖြစ်သွားဦးမှာ။ ချစ်တယ် 💗',en:'{you}, I\'m grown up. But when you pet me, I\'ll always be your baby. Love you 💗'},
  tidy:{my:'{you} ရေ၊ ငါ ကြီးပြီ! အမြဲ သန့်သန့်ရှင်းရှင်း ထားပေးခဲ့လို့ ကျေးဇူးတင်ပါတယ်။',en:'{you}, I\'m grown up! Thank you for always keeping me so clean and neat.'},
  sleepy:{my:'{you} ရေ၊ ငါ ကြီးပြီ… အား… ကျေးဇူးပဲ… နောက်မှ ဆက်ပြောမယ်… ဇ…',en:'{you}, I\'m grown up… *yawn*… thank you… I\'ll say more after my nap… zz…'},
  shy:{my:'{you} ရေ… ငါ ကြီးပြီ။ ငါ့ကို စောင့်ရှောက်ပေးခဲ့လို့… အရမ်း ကျေးဇူးတင်တယ်။',en:'{you}… I\'m grown up now. Thank you… so much… for looking after me.'}
};

window.PETLIFE={TRAITS,SND,sndKind,KEEP,CALLS,CALL_DEFAULT,L,MOMENTS,LETTER,DREAM,GROWN};
})();
