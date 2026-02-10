import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { Card, Button, CategoryBadge } from './UI';
import { ScheduleItem, Booking, HighlightTag, HighlightColor, WeatherInfo } from '../types';

// --- HELPER COMPONENT FOR SEARCH HIGHLIGHTING ---
const HighlightedText: React.FC<{ text: string | React.ReactNode; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim() || typeof text !== 'string') return <>{text}</>;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <>
            {parts.map((part, i) => 
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-200 text-stone-900 rounded-sm px-0.5 font-bold">{part}</mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

// --- MOCK DATA ---
const MOCK_SCHEDULE: ScheduleItem[] = [
  // --- 2/14 (Sat) Day 0: Pre-departure ---
  {
      id: 'd0-1', date: '2026-02-14', time: '21:20', displayTime: '21:20',
      title: '召喚小隊', enTitle: 'Quest Starts', location: 'TPE 桃園機場', category: '集合', categoryColor: 'teal',
      description: '冒險者大廳\n(桃園機場｜第２航廈｜中華航空團體櫃檯旁)',
      guideInfo: {
          story: "準備好踏入傳送陣，展開跨越中歐的奇幻旅程。",
          tip: "請檢查護照有效期限（需六個月以上），並確認行動電源放置於手提行李中。",
          highlights: [
              { id: 'h1', text: '護照帶了嗎', color: 'red' },
              { id: 'h2', text: '副本開啟', color: 'teal' },
              { id: 'h3', text: '滿血出發', color: 'orange' }
          ]
      }
  },

  // --- 2/15 (Sun) Day 1: TPE -> DXB -> PRG ---
  { 
      id: 'd1-1', date: '2026-02-15', time: '00:20', displayTime: '00:20',
      title: '開啟傳送陣', enTitle: 'Departure', location: 'TPE 桃園機場', category: '起飛', categoryColor: 'red',
      description: '往 DXB 杜拜機場'
  },
  { 
      id: 'd1-2', date: '2026-02-15', time: '06:15', displayTime: '06:15',
      title: '抵達新地圖', enTitle: 'Arrival', location: 'DXB 杜拜機場', category: '降落', categoryColor: 'red'
  },
  { 
      id: 'd1-3', date: '2026-02-15', time: '08:40', displayTime: '08:40',
      title: '登入中繼站', enTitle: 'Transfer Departure', location: 'DXB 杜拜機場', category: '轉機', categoryColor: 'orange',
      description: '往 PRG 布拉格'
  },
  { 
      id: 'd1-4', date: '2026-02-15', time: '12:30', displayTime: '12:30',
      title: '抵達新地圖', enTitle: 'Arrival', location: 'PRG 布拉格機場', category: '降落', categoryColor: 'red',
      description: '瓦茨拉夫·哈維爾國際機場'
  },
  { 
      id: 'd1-5', date: '2026-02-15', time: '14:00', 
      title: '老城廣場', enTitle: 'Old Town Square', location: '布拉格舊城區 (Staré Město)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/EbR7UJn3LuzL94aE6',
      guideInfo: {
          story: "自12世紀以來，這裡就是中歐最重要的市集廣場，是商貿路線的十字路口。",
          tip: "舊市政廳的塔樓是俯瞰廣場全景、拍攝泰恩教堂日落美景的最佳地點（有電梯）。",
          highlights: [
              { id: 'h1', text: '舊市政廳', color: 'red' },
              { id: 'h2', text: '泰恩教堂', color: 'purple' },
              { id: 'h3', text: '天文鐘', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd1-6', date: '2026-02-15', time: '15:00', 
      title: '火藥塔', enTitle: 'Powder Tower', location: '共和國廣場 (Náměstí Republiky)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/cobq4axapwgb5nNq5',
      guideInfo: {
          story: "這座晚期哥德式塔樓始建於1475年，是布拉格舊城區的13座城門之一。",
          tip: "塔樓內部有展覽並開放導覽（需爬186級旋轉樓梯）。火藥塔旁邊緊鄰著華麗的「市民會館」(Municipal House)，是布拉格新藝術運動風格的巔峰之作。",
          highlights: [
              { id: 'h1', text: '登塔186階', color: 'blue' },
              { id: 'h2', text: '市民會館', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd1-7', date: '2026-02-15', time: '16:00', 
      title: '布拉格天文鐘', enTitle: 'Prague Astronomical Clock', location: '舊市政廳南牆', category: '區域解鎖', categoryColor: 'red',
      mapUrl: 'https://maps.app.goo.gl/wSprGNidwrzM6Eb5A',
      guideInfo: {
          story: "位於舊市政廳的南面牆上，是廣場的靈魂。",
          tip: "請務必在「整點」前10-15分鐘卡位，觀賞長達45秒的耶穌十二門徒報時秀。",
          highlights: [
              { id: 'h1', text: '整點報時', color: 'red' },
              { id: 'h2', text: '耶穌十二門徒', color: 'green' },
              { id: 'h3', text: '可動式天文鐘冰箱貼', color: 'purple' }
          ]
      }
  },
  { 
      id: 'd1-8', date: '2026-02-15', time: '20:00', 
      title: 'Prague Marriott Hotel', enTitle: 'Accommodation', location: 'V Celnici 8, 110 00 Nové Město, Prague', category: '飯店', categoryColor: 'purple',
      mapUrl: 'https://maps.app.goo.gl/7BM4PTe8185hQjsu6',
      guideInfo: {
          story: "冒險者的豪華休憩驛站，位於市中心心臟地帶，恢復體力與整備物資的神聖領域。",
          tip: "飯店鄰近火藥塔與共和國廣場 (Náměstí Republiky)，步行即可抵達各大購物中心與舊城區。",
          highlights: [
              { id: 'h1', text: '五星級據點', color: 'purple' },
              { id: 'h2', text: '市中心地利', color: 'teal' }
          ]
      }
  },

  // --- 2/16 (Mon) Day 2: Prague ---
  { 
      id: 'd2-1', date: '2026-02-16', time: '09:00', 
      title: '查理士大橋', enTitle: 'Charles Bridge', location: '伏爾塔瓦河 (Vltava)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/KHgBnM7yiGxodwn86',
      guideInfo: {
          story: "這座橋是捷克最著名的地標，始建於一三五七年，由查理四世皇帝奠基（傳說他當時諮詢了天文學家，選擇了一三五七年九月七日五點三十一分這個「迴文」吉時）。",
          tip: "找到雕像底座的兩塊青銅浮雕（一塊描繪聖約翰被丟下河，一塊是騎士與狗），據說觸摸它們會帶來好運，並確保您能再次回到布拉格。",
          highlights: [
              { id: 'h1', text: '聖約翰雕像', color: 'purple' },
              { id: 'h2', text: '觸摸幸運符', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd2-2', date: '2026-02-16', time: '10:30', 
      title: '布拉格古堡', enTitle: 'Prague Castle', location: '城堡區 (Hradčany)', category: '區域解鎖', categoryColor: 'red',
      mapUrl: 'https://maps.app.goo.gl/XK51NPV4JhyTtMTh8',
      guideInfo: {
          story: "這不只是一座城堡，而是金氏世界紀錄認證的「世界上最大的古堡建築群」。\n\n這裡曾是波希米亞國王與神聖羅馬帝國皇帝的居所，集結了羅馬式、哥德式、文藝復興至巴洛克等千年的建築精華。\n\n城堡的心臟是「聖維特大教堂」(St. Vitus Cathedral)，這座耗時近 600 年才完工的哥德式傑作，不僅是歷代國王加冕之處，更是捷克精神的永恆象徵。",
          tip: "參觀主要景點需購買套票(Circuit B)。務必入內欣賞聖維特大教堂中慕夏(Alfons Mucha)設計的彩繪玻璃窗。每天中午12點在正門有衛兵交接。",
          highlights: [
              { id: 'h4', text: '金氏世界紀錄認證', color: 'orange' },
              { id: 'h1', text: '聖維特大教堂', color: 'purple' },
              { id: 'h2', text: '衛兵交接', color: 'red' },
              { id: 'h3', text: 'Circuit B', color: 'gray' }
          ]
      }
  },
  { 
      id: 'd2-3', date: '2026-02-16', time: '13:00', 
      title: '黃金小徑', enTitle: 'Golden Lane', location: '城堡區 (Hradčany)', category: '區域解鎖', categoryColor: 'red',
      mapUrl: 'https://maps.app.goo.gl/myHMM35Cz5zSB9HG7',
      guideInfo: {
          story: "這條位於城堡圍牆內色彩繽紛的小徑，最初建於 16 世紀末，原是城堡守衛的住所。\n\n傳說這裡曾是魯道夫二世的煉金術士試圖「煉製黃金」的實驗室，但這多半是後世杜撰的故事；實際上，小徑得名於後來遷居此地的金匠。\n\n著名作家卡夫卡 (Franz Kafka) 曾在1916至1917年間，於水藍色的「22號」房舍短暫居住並進行創作。\n在其居住期間內主要完成的作品為短篇小說集《鄉村醫生》(Ein Landarzt) 中的大部分故事。這段時間被認為是他創作生涯中非常平靜且多產的時期。",
          tip: "現在小房子內部被改造成各種主題展覽。",
          highlights: [
              { id: 'h1', text: 'No.22 卡夫卡', color: 'blue' },
              { id: 'h3', text: '金匠', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd2-4', date: '2026-02-16', time: '15:00', 
      title: '伏爾他瓦河遊船', enTitle: 'Vltava River Cruise', location: '什切廷碼頭', category: '區域解鎖', categoryColor: 'red',
      guideInfo: {
          story: "伏爾他瓦河是捷克的「母親河」，也是捷克民族精神的象徵。",
          tip: "靠近卡夫卡博物館的地方是著名的「天鵝餵食點」。在新城區一側的河岸 (Náplavka)則是當地人週末喜愛的農夫市集與酒吧聚集地。",
          highlights: [
              { id: 'h1', text: '遊船體驗', color: 'blue' },
              { id: 'h2', text: '天鵝餵食點', color: 'gray' },
              { id: 'h3', text: '河岸酒吧', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd2-5', date: '2026-02-16', time: '20:00', 
      title: 'Prague Marriott Hotel', enTitle: 'Accommodation', location: 'V Celnici 8, 110 00 Nové Město, Prague', category: '飯店', categoryColor: 'purple',
      mapUrl: 'https://maps.app.goo.gl/7BM4PTe8185hQjsu6',
      guideInfo: {
          story: "冒險者的豪華休憩驛站，位於市中心心臟地帶，恢復體力與整備物資的神聖領域。",
          tip: "飯店鄰近火藥塔與共和國廣場 (Náměstí Republiky)，步行即可抵達各大購物中心與舊城區。",
          highlights: [
              { id: 'h1', text: '五星級據點', color: 'purple' },
              { id: 'h2', text: '市中心地利', color: 'teal' }
          ]
      }
  },

  // --- 2/17 (Tue) Day 3: Prague ---
  { 
      id: 'd3-1', date: '2026-02-17', time: '09:00', 
      title: '捷克郵政總局', enTitle: 'Czech Post Office', location: '布格新城 (Nové Město)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/hCSgxbBEBKxW1FXr8',
      guideInfo: {
          story: "建於1871-1874年，採用宏偉的新文藝復興風格. 內部有表現通訊歷史的壁畫。",
          tip: "至今仍是正常運作的郵局，可免費進入大廳參觀。不妨在此購買郵票並寄出您的明信片體驗歷史。",
          highlights: [
              { id: 'h1', text: '新文藝復興', color: 'red' },
              { id: 'h2', text: '寄明信片', color: 'green' }
          ]
      }
  },
  { 
      id: 'd3-2', date: '2026-02-17', time: '10:30', 
      title: '捷克國家博物館', enTitle: 'National Museum', location: '瓦茨拉夫廣場 (Wenceslas Square)', category: '區域解鎖', categoryColor: 'red',
      mapUrl: 'https://maps.app.goo.gl/RQpVaL8PULVdoEgEA',
      guideInfo: {
          story: "這座雄偉的新文藝復興建築本身就是捷克國家認同的象徵。它成立於1818年，但現在的主建築於1891年完工。\n\n在19世紀「捷克民族復興」運動中，建立一個收藏捷克自然與歷史的博物館，是向當時統治的奧地利（哈布斯堡王朝）宣示捷克文化獨立性的重要舉動。\n\n「捷克民族復興」：針對奧地利哈布斯堡王朝統治下「德國化」政策的反動，目的是「搶救瀕臨滅絕的捷克語言與文化」。",
          tip: "從博物館頂樓的圓頂可以俯瞰整個瓦茨拉夫廣場. 主館與新館（原國會大廈）有地下通道相連。",
          highlights: [
              { id: 'h1', text: '圓頂景觀', color: 'blue' },
              { id: 'h2', text: '國家認同', color: 'red' }
          ]
      }
  },
  { 
      id: 'd3-cafe', date: '2026-02-17', time: '13:00', 
      title: '帝國咖啡廳', enTitle: 'Café Imperial', location: 'Na Poříčí 15, 110 00 Praha 1', category: '餐廳', categoryColor: 'orange',
      mapUrl: 'https://maps.app.goo.gl/yjbnNVFW7atNKhzL6',
      guideInfo: {
          story: "帝國咖啡廳坐落於布拉格帝國酒店（Art Deco Imperial Hotel）內，自 1914 年 開幕以來，就是文人雅士、政商名流聚集的場所。\n\n儘管經歷過二戰與共產時期的更迭，它依然完整保留了那份屬於「美好年代」（Belle Époque）的壯麗。這裡目前的靈魂人物是捷克名廚 Zdeněk Pohlreich，他讓這家百年老店在現代餐飲界依然保有一席之地。",
          tip: "＊招牌必點：\n燉羊膝 (Braised Lamb Shank)： 這是他們的明星料理，肉質軟嫩入味。\n捷克傳統料理： 如炸豬排、鴨胸或 Svíčková（奶油燉牛肉）。\n精緻甜點： 帝國蛋糕（Imperial Cake）是下午茶的最佳選擇。",
          highlights: [
              { id: 'h1', text: '美好年代 Belle Époque', color: 'orange' },
              { id: 'h2', text: '燉羊膝', color: 'red' },
              { id: 'h3', text: '百年名店', color: 'purple' }
          ]
      }
  },
  { 
      id: 'd3-3', date: '2026-02-17', time: '20:00', 
      title: 'Prague Marriott Hotel', enTitle: 'Accommodation', location: 'V Celnici 8, 110 00 Nové Město, Prague', category: '飯店', categoryColor: 'purple',
      mapUrl: 'https://maps.app.goo.gl/7BM4PTe8185hQjsu6',
      guideInfo: {
          story: "今晚繼續在同一個頂級基地休整，為接下來前往庫倫洛夫的旅程蓄積魔力。",
          tip: "飯店早餐非常豐富，建議準時下樓享用。附近有鈀金購物中心 (Palladium) 可作最後物資採買。",
          highlights: [
              { id: 'h1', text: '休整基地', color: 'purple' },
              { id: 'h2', text: '最後採買', color: 'orange' }
          ]
      }
  },

  // --- 2/18 (Wed) Day 4: Cesky Krumlov ---
  { 
      id: 'd4-1', date: '2026-02-18', time: '10:00', 
      title: '庫倫洛夫城堡', enTitle: 'Český Krumlov Castle', location: '彩繪塔周邊 (Zámek 庫倫洛夫城堡)', category: '登錄地圖', categoryColor: 'green',
      description: 'CK小鎮',
      mapUrl: 'https://maps.app.goo.gl/grD5vxzNSLBpn7889',
      guideInfo: {
          story: "規模僅次於布拉格城堡，輝煌的文藝復興與巴洛克面貌歸功於羅森堡家族 (Rosenberg)。",
          tip: "必去地標「彩繪塔」可俯瞰CK全景。宏偉的「斗篷橋」與護城河中飼養的「熊」也是亮點。",
          highlights: [
              { id: 'h1', text: '彩繪塔', color: 'red' },
              { id: 'h2', text: '斗篷橋', color: 'gray' },
              { id: 'h3', text: '護城河熊', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd4-2', date: '2026-02-18', time: '13:00', 
      title: '庫倫洛夫舊城區', enTitle: 'Český Krumlov Old Town (Vnitř內 Město)', location: '庫倫洛夫舊城 (Vnitř內 Město)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/b6So1t939ae8LC5A7',
      guideInfo: {
          story: "庫倫洛夫舊城區在1992年被聯合國教科學組織列為世界文化遺產，被譽為「中世紀的完美縮影」。漫步在完整保留十四至十七世紀建築風貌的巷弄間，彷彿時光倒流，置身於輝煌的文藝復興時期。",
          tip: "舊城區內幾乎禁止車輛通行，步行方式最佳。除了城堡，拉特蘭街 (Latrán) 也有許多絕佳拍照點。",
          highlights: [
              { id: 'h1', text: '世界遺產', color: 'blue' },
              { id: 'h2', text: '步行天堂', color: 'green' }
          ]
      }
  },
  { 
      id: 'd4-3', date: '2026-02-18', time: '18:00', 
      title: 'Hotel Grand Cesky Krumlov', enTitle: 'Accommodation', location: 'Náměstí Svornosti 3, 381 01 Český Krumlov', category: '飯店', categoryColor: 'purple',
      mapUrl: 'https://maps.app.goo.gl/hbXSojozrywPzo9r9',
      guideInfo: {
          story: "坐落在庫倫洛夫最具標誌性的舊城廣場中心，是體驗這座中世紀小鎮脈動的絕佳據點。",
          tip: "飯店位於行人徒步區核心。庫倫洛夫多為碎石路，建議行李箱使用較耐磨的輪子，或善用飯店接駁建議。從房間窗戶即有機會俯瞰廣場美景。",
          highlights: [
              { id: 'h1', text: '廣場核心', color: 'purple' },
              { id: 'h2', text: '中世紀古宅', color: 'orange' },
              { id: 'h3', text: '碎石路注意', color: 'red' }
          ]
      }
  },

  // --- 2/19 (Thu) Day 5: Salzburg ---
  { 
      id: 'd5-1', date: '2026-02-19', time: '09:00', 
      title: '莫札特故居', enTitle: 'Mozart Residence', location: '格特萊德街 (Getreidegasse)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/JiHurAt2cuXSMmAHA',
      guideInfo: {
          story: "莫札特一家在1773年時搬入的住所 (Wohnhaus)，而非出生地。",
          tip: "「出生地」在舊城區（黃色建築），而此處位於新城區馬卡特廣場，展品側重於家族生活和樂器。",
          highlights: [
              { id: 'h1', text: '故居 Wohnhaus', color: 'red' },
              { id: 'h2', text: '家族生活', color: 'green' }
          ]
      }
  },
  { 
      id: 'd5-2', date: '2026-02-19', time: '10:30', 
      title: '米拉貝爾花園', enTitle: 'Mirabell Palace & Gardens', location: '薩爾斯堡新城 (Schloss Mirabell)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/UFJmcNbFmcCPXJ6J6',
      guideInfo: {
          story: "這座精美的巴洛克式花園，背後藏著一段驚世駭俗的愛情故事。它由 17 世紀的大主教 沃爾夫·迪特里希 (Wolf Dietrich) 為情婦 莎樂美·阿爾特 (Salome Alt) 和他們的 15 個孩子所建，名副其實的「愛之宮」。\n\n＊天主教的神職人員不可婚配及生子。",
          tip: "此地因電影《真善美》而聞名全球，瑪麗亞正是圍繞著園內的飛馬噴泉教孩子們唱〈Do-Re-Mi〉。\n\n花園免費開放。從這裡可以完美地「框」住遠處山丘上的莎姿堡城堡，是經典拍照角度。",
          highlights: [
              { id: 'h1', text: '真善美', color: 'purple' },
              { id: 'h2', text: '飛馬噴泉', color: 'orange' },
              { id: 'h3', text: '禁忌之愛', color: 'red' }
          ]
      }
  },
  { 
      id: 'd5-3', date: '2026-02-19', time: '13:00', 
      title: '莎姿堡城堡', enTitle: 'Hohensalzburg Fortress', location: '僧侶山 (Mönchsberg)', category: '區域解鎖', categoryColor: 'red',
      description: '(含上下纜車)',
      mapUrl: 'https://maps.app.goo.gl/25TfrB8To8oUhBHLA',
      guideInfo: {
          story: "歐洲現存規模最大的中世紀城堡之一，矗立在舊城區上方。它的主要功能是「防禦」和「彰顯權力」，用來保護大主教們免受外敵（和城內叛亂市民）的威脅，並控制富可敵國的「鹽」貿易。這座城堡在長達900多年的歷史中，從未被敵人攻陷過。",
          tip: "搭乘城堡纜車僅需1分鐘。觀景台是俯瞰薩爾斯堡的最佳地點。內部有木偶博物館與酷刑室。",
          highlights: [
              { id: 'h1', text: '城堡纜車', color: 'red' },
              { id: 'h2', text: '全景觀景台', color: 'blue' },
              { id: 'h3', text: '黃金廳', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd5-hotel', date: '2026-02-19', time: '20:00', 
      title: 'Strandhotel Margaretha', enTitle: 'Accommodation', location: 'Seepromenade 21, 5322 St. Gilgen, Austria', category: '飯店', categoryColor: 'purple',
      mapUrl: 'https://maps.app.goo.gl/TQd11ofvzu4kJR676',
      guideInfo: {
          story: "位於沃夫岡湖畔的絕美休憩點。",
          tip: "聖吉爾根是莫札特母親的故鄉，風景秀麗。",
          highlights: [
              { id: 'h1', text: '湖畔飯店', color: 'purple' },
              { id: 'h2', text: '絕美湖景', color: 'blue' }
          ]
      }
  },

  // --- 2/20 (Fri) Day 6: Austria -> Germany -> Austria ---
  { 
      id: 'd6-1', date: '2026-02-20', time: '09:30', 
      title: '國王湖遊船', enTitle: 'Königssee', location: '德國貝希特斯加登 (Berchtesgaden)', category: '區域解鎖', categoryColor: 'red',
      description: 'Königssee',
      mapUrl: 'https://maps.app.goo.gl/WB3CMR6fsZ4wGTXF6',
      guideInfo: {
          story: "德國最深、最乾淨的湖泊，冰川侵蝕形成的峽灣型湖泊。",
          tip: "船行中船長會吹奏小號演示「回音」。必看紅頂的「聖巴多羅買教堂」。建議步行至如仙境般的「上湖 (Obersee)」。",
          highlights: [
              { id: 'h1', text: '電動船', color: 'blue' },
              { id: 'h2', text: '回音', color: 'red' },
              { id: 'h3', text: '上湖', color: 'green' }
          ]
      }
  },
  { 
      id: 'd6-2', date: '2026-02-20', time: '13:00', 
      title: '鹽礦探秘之旅', enTitle: 'Salt Mine Tour', location: '哈萊因 (Hallein) /貝希特斯加登', category: '區域解鎖', categoryColor: 'red',
      mapUrl: 'https://maps.app.goo.gl/khDxgJfHDWY6TwhU6',
      guideInfo: {
          story: "「鹽」是中世紀的白金. 此區財富均來自鹽礦。",
          tip: "需換上傳統礦工服。體驗亮點是兩段刺激的木製溜滑梯，以及搭乘木筏渡過地底鹽水湖。",
          highlights: [
              { id: 'h1', text: '木製溜滑梯', color: 'orange' },
              { id: 'h2', text: '礦工服', color: 'gray' },
              { id: 'h3', text: '地底鹽湖', color: 'blue' }
          ]
      }
  },
  { 
      id: 'd6-hotel', date: '2026-02-20', time: '20:00', 
      title: 'Strandhotel Margaretha', enTitle: 'Accommodation', location: 'Seepromenade 21, 5322 St. Gilgen, Austria', category: '飯店', categoryColor: 'purple',
      mapUrl: 'https://maps.app.goo.gl/TQd11ofvzu4kJR676',
      guideInfo: {
          story: "第二晚駐紮於沃夫岡湖畔，享受寧靜夜晚。",
          highlights: [
              { id: 'h1', text: '湖畔連泊', color: 'purple' }
          ]
      }
  },

  // --- 2/21 (Sat) Day 7: Germany/Austria Border ---
  { 
      id: 'd7-1', date: '2026-02-21', time: '09:00', 
      title: '哈斯達特小鎮', enTitle: 'Hallstatt Old Town', location: '哈修塔特湖區 (Hallstatt)', category: '登錄地圖', categoryColor: 'green',
      description: 'Hallstatt',
      mapUrl: 'https://maps.app.goo.gl/MnHJtGZ3FC9mLT2SA',
      guideInfo: {
          story: "1997年列為世界文化遺產，被譽為世界上最美的小鎮之一，歷史與鹽礦密不可分。",
          tip: "經典明信片角度位於小鎮北側公路旁。因墓地專用空間有限，教堂旁有獨特的「人骨室」。",
          highlights: [
              { id: 'h1', text: '世界遺產', color: 'blue' },
              { id: 'h2', text: '人骨室', color: 'gray' }
          ]
      }
  },
  { 
      id: 'd7-2', date: '2026-02-21', time: '13:00', 
      title: '百水公寓', enTitle: 'Hundertwasser House', location: '維也納第3區 (Landstraße)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/dcfSuaNqNjkhTEJp6',
      guideInfo: {
          story: "這座公寓於 1985 年完工，是由奧地利身兼藝術家與建築師雙重身分的「百水先生」(Friedensreich Hundertwasser) 所設計，堪稱維也納建築界獨樹一幟的異數。\n\n百水先生極度痛恨「直線」，甚至稱其為「邪惡的產物」；相反地，他推崇回歸自然與有機的形態。這座公寓，正是他將這些反骨理念付諸實踐的集大成之作。",
          tip: "內部有居民無法參觀。建議去對面的「百水藝術村」商場體驗其風格，或步行至附近的百水藝術館。",
          highlights: [
              { id: 'h1', text: '奇特建築', color: 'orange' },
              { id: 'h2', text: '百水藝術村', color: 'green' }
          ]
      }
  },
  { 
      id: 'd7-hotel', date: '2026-02-21', time: '20:00', 
      title: 'Hilton Vienna Plaza', enTitle: 'Accommodation', location: 'Schottenring 11, 1010 Wien, Austria', category: '飯店', categoryColor: 'purple',
      mapUrl: 'https://maps.app.goo.gl/xyrDAJLPd5zejjCp9',
      guideInfo: {
          story: "位於維也納戒指大道上的精緻酒店，裝飾藝術風格令人難忘。",
          highlights: [
              { id: 'h1', text: 'Art Deco', color: 'purple' },
              { id: 'h2', text: '戒指大道', color: 'teal' }
          ]
      }
  },

  // --- 2/22 (Sun) Day 8: Hallstatt/Vienna ---
  { 
      id: 'd8-1', date: '2026-02-22', time: '09:00', 
      title: '瑪麗亞特蕾莎廣場', enTitle: 'Maria-Theresien-Platz', location: '博物館區 (Museumquartier)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/ZZbtf4VG7tezXwBz6',
      guideInfo: {
          story: "哈布斯堡王朝的唯一女性統治者—瑪麗亞·特蕾莎 (Maria Theresa) 被戲稱為「歐洲丈母娘」aka 歐洲岳母，主要原因是她將「聯姻外交」發揮到了極致。\n\n她一生生育了 16 個孩子（其中 10 個活到成年），並將絕大多數的女兒都嫁給了歐洲各國的君主 or 王儲，以此來鞏固奧地利與各國的盟友關係，達成政治目的。",
          tip: "兩側矗立著「雙胞胎」建築：藝術史博物館與自然史博物館. 後方即是現代化的維也納博物館區 (MQ)。",
          highlights: [
              { id: 'h1', text: '藝術史博物館', color: 'red' },
              { id: 'h2', text: '自然史博物館', color: 'green' }
          ]
      }
  },
  { 
      id: 'd8-2', date: '2026-02-22', time: '10:00', 
      title: '霍夫堡宮', enTitle: 'The Hofburg', location: '維也納第1區 (Innere Stadt)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/bPPsM1JA2y2oMD8U6',
      guideInfo: {
          story: "哈布斯堡王朝的冬宮，也是西西 (Sisi，伊莉莎白皇后) 的黃金牢籠。\n\n西西 (Sisi) 是伊莉莎白皇后的真實暱稱，茜茜則是電影譯名。\n霍夫堡宮是西西皇后權力的象徵，也是她痛苦的根源。在這裡看到的不是一個幸福皇后的家，而是一位女性試圖在壓抑體制中，衝撞並尋找自我的掙扎痕跡。",
          tip: "參觀重點包含西西博物館、皇家公寓與銀器收藏館。西班牙馬術學校也位於此區。\n\n＊西西 (Sisi) 皇后的關鍵展品\n個人物品： 西西皇后的梳妝用具、體操器材、旅行藥箱。\n著名禮服： 重現了她著名的匈牙利加冕禮服複製件。\n死亡證明： 展示了她在日內瓦遇刺時的相關文件與黑色的喪服（兒子自殺後她只穿黑衣）。",
          highlights: [
              { id: 'h0', text: '冬宮', color: 'blue' },
              { id: 'h1', text: '西西博物館', color: 'purple' },
              { id: 'h2', text: '皇家公寓', color: 'red' },
              { id: 'h3', text: '銀器館', color: 'gray' }
          ]
      }
  },
  { 
      id: 'd8-3', date: '2026-02-22', time: '11:00', 
      title: '黑死病紀念柱', enTitle: 'Plague Column (Pestsäule)', location: '格拉本大街 (Graben)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/doX4N77JodZMSQ1r8',
      guideInfo: {
          story: "紀念1679年奪走維也納三分之一人口的瘟疫。",
          tip: "位於步行街中央的露天雕塑。紀念柱的最頂端是「聖三一」（父、子、聖靈），中間是皇帝利奧波德一世跪地祈禱的雕像，底座則是象徵瘟疫的女巫。\n\n＊可至附近的德梅爾咖啡店（Café Demel）購買維也納知名甜點「糖漬紫羅蘭 Candied Violets」。",
          highlights: [
              { id: 'h1', text: '聖三一', color: 'orange' },
              { id: 'h2', text: '巴洛克雕塑', color: 'gray' },
              { id: 'h3', text: '糖漬紫羅蘭', color: 'purple' }
          ],
          relatedLink: {
              text: "Café Demel 導航",
              url: "https://maps.app.goo.gl/eSfnykh5Q4NUy6SCA"
          }
      }
  },
  { 
      id: 'd8-karl', date: '2026-02-22', time: '12:00', 
      title: '卡爾教堂', enTitle: "Karlskirche / St. Charles's Church", location: '維也納卡爾廣場 (Karlsplatz)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/eaqnJq4gQpF3q1cNA',
      guideInfo: {
          story: "這座教堂被公認為維也納巴洛克建築的巔峰之作。\n1713年，維也納遭逢歐洲最後一次大規模瘟疫肆虐期間，哈布斯堡王朝皇帝卡爾六世（Charles VI）為了還願，下令興建此教堂，獻給在天主教中被尊為對抗瘟疫守護聖人的聖查理・波羅密歐（Charles Borromeo）。\n\n建築風格極具象徵性，融合了古希臘神殿式門廊、仿古羅馬圖拉真柱的雙柱設計（柱身浮雕描繪聖人的一生），以及以巴洛克語彙詮釋的巨大橢圓形穹頂，展現出跨越古典文明與信仰意象的建築語言。",
          tip: "拍照點：教堂前方的水池在無風時可以拍到完美的倒影，是攝影愛好者的最愛。\n全景電梯：教堂內部有時會架設一座透明的「全景電梯」，可以直達穹頂（約32公尺高），近距離欣賞華麗的濕壁畫（需另外購票）。",
          highlights: [
              { id: 'h1', text: '巴洛克巔峰', color: 'purple' },
              { id: 'h2', text: '圖拉真柱', color: 'orange' },
              { id: 'h3', text: '絕美倒影', color: 'blue' }
          ]
      }
  },
  { 
      id: 'd8-4', date: '2026-02-22', time: '14:00', 
      title: '熊布朗宮 (美泉宮)', enTitle: 'Schönbrunn Palace', location: '維也納第13區 (Hietzing)', category: '區域解鎖', categoryColor: 'red',
      description: 'Schönbrunn Palace',
      mapUrl: 'https://maps.app.goo.gl/nommjbpqLek8AkKL6',
      guideInfo: {
          story: "1996年列為世界文化遺產。此處原為皇家狩獵小屋，後經瑪麗亞·特蕾莎女皇（歐洲丈母娘）改建為巴洛克式宮殿。\n\n這裡曾是6歲神童莫札特演奏之地，也是末代皇帝卡爾一世簽署放棄權力文件、終結帝國統治的歷史現場。",
          tip: "購票：參觀宮殿內部必須購票（如 Imperial Tour 或 Grand Tour），強烈建議「提早上網預訂」。\n花園：宮殿後方的法式花園是免費開放的。\n凱旋門：務必爬上花園對面的山丘，抵達「凱旋門」，那是俯瞰全景的「最佳地點」。\n動物園：世界上現古老的動物園也位於此。",
          highlights: [
              { id: 'h0', text: '夏宮', color: 'blue' },
              { id: 'h3', text: '世界文化遺產', color: 'red' },
              { id: 'h1', text: '凱旋門觀景', color: 'orange' },
              { id: 'h2', text: '神童莫札特', color: 'purple' },
              { id: 'h4', text: '最古老動物園', color: 'green' }
          ]
      }
  },
  { 
      id: 'd8-hotel', date: '2026-02-22', time: '20:00', 
      title: 'Hilton Vienna Plaza', enTitle: 'Accommodation', location: 'Schottenring 11, 1010 Wien, Austria', category: '飯店', categoryColor: 'purple',
      mapUrl: 'https://maps.app.goo.gl/xyrDAJLPd5zejjCp9',
      guideInfo: {
          story: "今晚繼續在維也納希爾頓廣場飯店休憩。",
          highlights: [
              { id: 'h1', text: '優雅連泊', color: 'purple' }
          ]
      }
  },

  // --- 2/23 (Mon) Day 9: Vienna ---
  { 
      id: 'd9-2', date: '2026-02-23', time: '10:00', 
      title: '聖史帝芬教堂', enTitle: "St. Stephen's Cathedral", location: '史蒂芬廣場 (Stephansplatz)', category: '區域解鎖', categoryColor: 'red',
      description: '(南塔、北塔二擇一登頂)',
      mapUrl: 'https://maps.app.goo.gl/d6ob7ph5DwFvTL949',
      guideInfo: {
          story: "維也納的靈魂象徵，始建於12世紀. 曾在二戰末期的1945年幾乎被大火燒毀並重建。\n\n身體 (Body) → 嘉布遣會教堂 (Kapuzinerkirche)\n心臟 (Heart) → 奧古斯丁教堂 (Augustinerkirche)\n內臟 (Viscera) → 聖史帝芬教堂 (Stephansdom)",
          tip: "南塔需爬343階樓梯但景色最佳；北塔有電梯可看普默林大鐘。亦可參加導覽參觀存放著哈布斯堡王朝早期成員內臟的地下墓穴。\n\n＊可至附近的德梅爾咖啡店（Café Demel）購買維也納知名甜點「糖漬紫羅蘭 Candied Violets」。",
          highlights: [
              { id: 'h1', text: '南塔(樓梯)', color: 'red' },
              { id: 'h2', text: '北塔(電梯)', color: 'blue' },
              { id: 'h3', text: '地下墓穴', color: 'gray' },
              { id: 'h4', text: '糖漬紫羅蘭', color: 'purple' }
          ],
          relatedLink: {
              text: "Café Demel 導航",
              url: "https://maps.app.goo.gl/eSfnykh5Q4NUy6SCA"
          }
      }
  },
  { 
      id: 'd9-3', date: '2026-02-23', time: '14:00', 
      title: '潘朵夫購物村', enTitle: 'Designer Outlet Parndorf', location: '潘朵夫 (Parndorf)', category: '區域解鎖', categoryColor: 'red',
      description: 'Parndorf Outlet',
      mapUrl: 'https://maps.app.goo.gl/kSB8ToNAZydoHitT7',
      guideInfo: {
          story: "中歐最大的設計師暢貨中心之一，擁有充滿布爾根蘭州傳統風格的建築設計。",
          tip: "建議先至遊客中心領取地圖與額外折扣券。退稅手續可在現場辦理（需信用卡擔保），或是留到機場處理。",
          highlights: [
              { id: 'h1', text: '購物天堂', color: 'red' },
              { id: 'h2', text: '退稅服務', color: 'blue' }
          ]
      }
  },
  { 
      id: 'd9-4', date: '2026-02-23', time: '21:45', displayTime: '21:45',
      title: '開啟傳送陣', enTitle: 'Departure', location: 'VIE 維也納國際機場', category: '起飛', categoryColor: 'red',
      description: '往 DXB 杜拜機場'
  },

  // --- 2/24 (Tue) Day 10/11: DXB -> TPE ---
  { 
      id: 'd10-1', date: '2026-02-24', time: '06:25', displayTime: '06:25',
      title: '抵達新地圖', enTitle: 'Arrival', location: 'DXB 杜拜機場', category: '降落', categoryColor: 'red'
  },
  { 
      id: 'd10-2', date: '2026-02-24', time: '08:45', displayTime: '08:45',
      title: '登入中繼站', enTitle: 'Transfer Departure', location: 'DXB 杜拜機場', category: '轉機', categoryColor: 'orange',
      description: '往 TPE 桃園機場'
  },
  { 
      id: 'd10-3', date: '2026-02-24', time: '20:40', displayTime: '20:40',
      title: '任務完成', enTitle: 'Arrival', location: 'TPE 桃園機場', category: '抵達', categoryColor: 'green',
      description: '抵達溫慢的家',
      guideInfo: {
        story: "勇者凱旋！",
        highlights: [
            { id: 'm1', text: '成就達成', color: 'green' },
            { id: 'm2', text: '冒險終章', color: 'teal' }
        ]
      }
  },
];

// --- SHARED UTILS ---
const TAG_COLORS: Record<HighlightColor, string> = {
    red: 'bg-red-50 text-red-600 border-red-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
    teal: 'bg-teal-50 text-teal-600 border-teal-200'
};

const NODE_TEXT_COLORS: Record<HighlightColor, string> = {
    red: 'text-red-500',
    orange: 'text-orange-500',
    green: 'text-emerald-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    gray: 'text-gray-500',
    teal: 'text-teal-500'
};

const LUNAR_DATES: Record<string, string> = {
    '2026-02-14': '西洋情人節',
    '2026-02-15': '小年夜',
    '2026-02-16': '除夕',
    '2026-02-17': '初一',
    '2026-02-18': '初二',
    '2026-02-19': '初三',
    '2026-02-20': '初四',
    '2026-02-21': '初五',
    '2026-02-22': '初六'
};

const mapWmoToCondition = (code: number): WeatherInfo['condition'] => {
    if (code === 0) return 'sunny';
    if (code <= 3) return 'cloudy';
    if (code <= 48) return 'cloudy';
    if (code <= 67) return 'rain';
    if (code <= 77) return 'snow';
    if (code <= 82) return 'rain';
    if (code <= 86) return 'snow';
    return 'rain';
};

/**
 * 精準圖標適配邏輯
 */
const getCategoryIcon = (item: ScheduleItem): string => {
    const title = item.title;
    
    if (title.includes('布拉格古堡')) return 'fa-solid fa-chess-rook';
    if (title.includes('庫倫洛夫城堡')) return 'fa-brands fa-fort-awesome'; 
    if (title.includes('米拉貝爾花園')) return 'fa-solid fa-music';
    if (title.includes('莎姿堡城堡')) return 'fa-solid fa-tower-observation';
    
    if (title.includes('國王湖') || title.includes('遊船')) return 'fa-solid fa-ship';
    if (title.includes('鹽礦')) return 'fa-solid fa-gem';
    if (title.includes('天文鐘')) return 'fa-solid fa-clock';
    if (title.includes('黃金小徑')) return 'fa-solid fa-person-walking';
    // 優先匹配標題包含「咖啡」或類別為「餐廳」的圖示
    if (title.includes('咖啡') || item.category === '餐廳') return 'fa-solid fa-utensils';
    if (title.includes('購物') || title.includes('Outlet')) return 'fa-solid fa-bag-shopping';
    
    if (title.includes('教堂')) return 'fa-solid fa-church';
    if (title.includes('城堡')) return 'fa-solid fa-chess-rook';
    if (title.includes('宮')) return 'fa-solid fa-landmark-dome';
    if (title.includes('廣場')) return 'fa-solid fa-mountain-city';
    if (title.includes('塔')) return 'fa-solid fa-tower-observation';
    if (title.includes('郵政') || title.includes('郵局')) return 'fa-solid fa-envelope-open-text';
    if (title.includes('公寓') || title.includes('故居')) return 'fa-solid fa-building-user';
    if (title.includes('大橋')) return 'fa-solid fa-bridge';
    if (title.includes('博物館')) return 'fa-solid fa-building-columns';
    if (title.includes('小鎮')) return 'fa-solid fa-city';
    if (title.includes('紀念柱')) return 'fa-solid fa-monument';
    
    if (item.category === '抵達') return 'fa-solid fa-trophy';
    if (item.title.includes('召喚')) return 'fa-solid fa-hat-wizard';
    if (item.category === '集合') return 'fa-solid fa-dragon';
    if (item.category === '起飛') return 'fa-solid fa-plane-up';
    if (item.category === '降落') return 'fa-solid fa-plane-arrival';
    if (item.category === '轉機') return 'fa-solid fa-shuffle';
    if (item.category === '區域解鎖') return 'fa-solid fa-unlock-keyhole';
    if (item.category === '登錄地圖') return 'fa-solid fa-map-location-dot';
    
    if (item.category === 'transport') return 'fa-solid fa-train-subway';
    if (item.category === '飯店') return 'fa-solid fa-hotel';
    if (title.includes('花園') || title.includes('湖')) return 'fa-solid fa-tree';
    
    return 'fa-solid fa-location-dot';
};

const ScheduleItemRow: React.FC<{ item: ScheduleItem; showDate?: boolean; searchTerm?: string }> = ({ item, showDate, searchTerm = '' }) => {
    // 飯店類別不顯示左側時間
    const isHotel = item.category === '飯店' || item.category === 'stay';
    // 恢復原始 isMajor 範疇（交通、起降、集合），但針對「帝國咖啡廳」(id: d3-cafe) 額外開啟顯示時間標籤，其餘景點類別不顯示時間
    const isMajor = ['transport', '集合', '起飛', '降落', '轉機', '抵達'].includes(item.category) || item.id === 'd3-cafe';
    
    const timeStr = item.displayTime || item.time;
    const [mainTime, subTime] = timeStr.includes('\n') ? timeStr.split('\n') : [timeStr, null];
    const [hour, minute] = mainTime.split(':');
    const iconClasses = getCategoryIcon(item);

    return (
        <div className="relative mb-2 flex gap-0 group">
            <div className="w-12 py-4 flex flex-col items-end justify-start flex-shrink-0 pr-2">
                {!isHotel && isMajor ? (
                    <>
                        <div className="flex items-baseline justify-end gap-[1px] leading-none text-zen-text">
                            <span className="text-xl font-mono font-bold tracking-tighter text-stone-700">{hour}</span>
                            <span className="text-sm font-mono font-bold text-stone-400">:{minute}</span>
                        </div>
                        {subTime && (
                            <span className="text-[9px] text-gray-300 font-mono mt-1 text-right leading-tight">{subTime}</span>
                        )}
                    </>
                ) : (
                    <div className="h-full w-full"></div>
                )}
            </div>
            <div className="relative flex flex-col items-center px-0 flex-shrink-0 w-6">
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] border-l-2 border-dashed border-stone-300/60"></div>
                <div 
                    className={`
                        relative z-10 flex items-center justify-center transition-all duration-300 mt-[1.4rem]
                        bg-zen-bg rounded-full border-2 
                        ${isMajor || isHotel || ['區域解鎖', '登錄地圖'].includes(item.category)
                            ? `w-8 h-8 ${NODE_TEXT_COLORS[item.categoryColor || 'gray']} border-current shadow-sm bg-white` 
                            : `w-7 h-7 text-stone-400 border-stone-300 bg-white`
                        }
                    `}
                >
                    <i className={`${iconClasses} text-sm`}></i>
                </div>
            </div>
            <div className="flex-grow min-w-0 py-2 pb-6 pl-3">
                <div className="bg-white rounded-2xl p-4 shadow-zen border border-stone-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-zen-hover relative overflow-hidden">
                    {showDate && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-stone-100 text-[9px] font-black text-stone-400 rounded-bl-xl uppercase tracking-widest z-20 border-b border-l border-stone-50">
                            {item.date}
                        </div>
                    )}
                    <div className="absolute -bottom-4 -right-4 text-8xl text-stone-800 opacity-[0.03] transform -rotate-12 pointer-events-none select-none z-0">
                        <i className={`${iconClasses}`}></i>
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start gap-2 mb-1">
                            <div className="flex flex-col">
                                <h3 className="font-bold text-lg leading-tight text-zen-text">
                                    <HighlightedText text={item.title} highlight={searchTerm} />
                                </h3>
                                {item.enTitle && (
                                    <span className="text-[10px] font-mono text-gray-400 font-medium tracking-wide mt-0.5 uppercase">
                                        <HighlightedText text={item.enTitle} highlight={searchTerm} />
                                    </span>
                                )}
                            </div>
                            <div className="flex-shrink-0 mt-0.5 opacity-80 scale-90 origin-top-right">
                                <CategoryBadge type={item.category} color={item.categoryColor} />
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mb-2 mt-1 min-w-0">
                            <i className="fa-solid fa-location-dot text-[10px] text-zen-primary flex-shrink-0"></i> 
                            <span className="truncate font-medium flex-1 min-w-0 leading-none">
                                <HighlightedText text={item.location} highlight={searchTerm} />
                            </span>
                            {item.mapUrl && (
                                <a 
                                    href={item.mapUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 active:bg-stone-300 transition-all flex-shrink-0 border border-stone-200/60 shadow-sm"
                                >
                                    <i className="fa-solid fa-diamond-turn-right text-xs"></i>
                                </a>
                            )}
                        </div>
                        {item.description && (
                            <div className="text-xs text-gray-400 font-medium whitespace-pre-line leading-relaxed mb-2 pl-4 border-l-2 border-stone-100">
                                <HighlightedText text={item.description} highlight={searchTerm} />
                            </div>
                        )}
                        {(item.guideInfo?.story || item.guideInfo?.tip || (item.guideInfo?.highlights && item.guideInfo.highlights.length > 0)) && (
                            <div className="mt-4 pt-3 border-t border-dashed border-gray-100">
                                {item.guideInfo?.story && (
                                    <div className="text-sm text-gray-600 leading-relaxed font-sans mb-3 whitespace-pre-line text-left">
                                        <HighlightedText text={item.guideInfo.story} highlight={searchTerm} />
                                    </div>
                                )}
                                {item.guideInfo?.tip && (
                                    <div className="bg-orange-50/50 border border-orange-100 p-3 mb-3 rounded-lg relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-300"></div>
                                        <div className="flex gap-2 relative z-10">
                                            <i className="fa-solid fa-lightbulb text-orange-400 mt-0.5 text-xs"></i>
                                            <p className="text-xs text-orange-800 font-medium leading-relaxed whitespace-pre-line">
                                                <HighlightedText text={item.guideInfo.tip} highlight={searchTerm} />
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {item.guideInfo?.highlights && item.guideInfo.highlights.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {item.guideInfo.highlights.map(h => (
                                            <span key={h.id} className={`text-[10px] px-2.5 py-1 rounded-full border font-bold shadow-sm ${TAG_COLORS[h.color]}`}>
                                                <HighlightedText text={h.text} highlight={searchTerm} />
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* 行程推薦地點導航按鈕 (例如德梅爾咖啡) */}
                                {item.guideInfo?.relatedLink && (
                                    <div className="mt-4 flex justify-end">
                                        <a 
                                            href={item.guideInfo.relatedLink.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-zen-primary/30 text-zen-primary text-[11px] font-black shadow-sm hover:shadow-md hover:bg-zen-primary/5 active:scale-95 transition-all group/nav"
                                        >
                                            <i className="fa-solid fa-utensils text-zen-primary/60 group-hover/nav:scale-110 transition-transform"></i>
                                            <span>{item.guideInfo.relatedLink.text}</span>
                                            <i className="fa-solid fa-chevron-right text-[8px] opacity-40 group-hover/nav:translate-x-0.5 transition-transform"></i>
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SCHEDULE TAB ---
export const ScheduleTab: React.FC<{ searchTerm?: string }> = ({ searchTerm = "" }) => {
    const [selectedDate, setSelectedDate] = useState('2026-02-14');
    const [weather, setWeather] = useState<WeatherInfo>({ condition: 'cloudy', temp: 5, locationName: '布拉格' });
    const [loadingWeather, setLoadingWeather] = useState(false);
    const dateScrollRef = useRef<HTMLDivElement>(null);

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return MOCK_SCHEDULE;
        const lowerTerm = searchTerm.toLowerCase();
        return MOCK_SCHEDULE.filter(item => 
            item.title.toLowerCase().includes(lowerTerm) ||
            item.location.toLowerCase().includes(lowerTerm) ||
            item.enTitle?.toLowerCase().includes(lowerTerm) ||
            item.description?.toLowerCase().includes(lowerTerm) ||
            (typeof item.guideInfo?.story === 'string' && item.guideInfo.story.toLowerCase().includes(lowerTerm)) ||
            item.guideInfo?.tip?.toLowerCase().includes(lowerTerm)
        );
    }, [searchTerm]);

    const groupedItems = useMemo(() => {
        const groups: Record<string, ScheduleItem[]> = {};
        filteredItems.forEach(item => {
            if (!groups[item.date]) groups[item.date] = [];
            groups[item.date].push(item);
        });
        return groups;
    }, [filteredItems]);

    const dates = useMemo(() => Array.from(new Set(MOCK_SCHEDULE.map(i => i.date))).sort(), []);
    const currentIndex = dates.indexOf(selectedDate);

    useEffect(() => {
        if (dateScrollRef.current) {
            const index = dates.indexOf(selectedDate);
            if (index >= 0) {
                const container = dateScrollRef.current;
                const itemCenter = 16 + index * (52 + 8) + 52 / 2;
                const containerCenter = container.clientWidth / 2;
                const scrollLeft = itemCenter - containerCenter;
                container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }
    }, [selectedDate, dates]);

    useEffect(() => {
        const fetchWeather = async () => {
            setLoadingWeather(true);
            let url = '';
            let locationName = '';
            if (selectedDate === '2026-02-14') {
                url = 'https://api.open-meteo.com/v1/forecast?latitude=25.03&longitude=121.56&current_weather=true&timezone=auto';
                locationName = '桃園';
            } else if (selectedDate >= '2026-02-15' && selectedDate <= '2026-02-19') {
                url = 'https://api.open-meteo.com/v1/forecast?latitude=50.08&longitude=14.43&current_weather=true&timezone=auto';
                locationName = '布拉格';
            } else if (selectedDate === '2026-02-20') {
                url = 'https://api.open-meteo.com/v1/forecast?latitude=47.59&longitude=12.99&current_weather=true&timezone=auto';
                locationName = '貝希特斯加登';
            } else if (selectedDate >= '2026-02-21' && selectedDate <= '2026-02-24') {
                url = 'https://api.open-meteo.com/v1/forecast?latitude=48.21&longitude=16.37&current_weather=true&timezone=auto';
                locationName = '維也納';
            } else {
                 url = 'https://api.open-meteo.com/v1/forecast?latitude=50.08&longitude=14.43&current_weather=true&timezone=auto';
                 locationName = '歐洲';
            }
            try {
                const res = await fetch(url);
                const data = await res.json();
                if (data.current_weather) {
                    setWeather({
                        temp: Math.round(data.current_weather.temperature),
                        condition: mapWmoToCondition(data.current_weather.weathercode),
                        locationName: locationName
                    });
                }
            } catch (error) {
                console.error("Failed to fetch weather", error);
            } finally {
                setLoadingWeather(false);
            }
        };
        fetchWeather();
    }, [selectedDate]);

    const getLocationInfo = (date: string) => {
        if (date === '2026-02-14') return '台灣 Taiwan';
        if (date >= '2026-02-15' && date <= '2026-02-19') return '捷克 Czech Republic';
        if (date === '2026-02-20') return '德國 Germany';
        if (date >= '2026-02-21' && date <= '2026-02-24') return '奧地利 Austria';
        return '歐洲 Europe';
    };

    const lunarText = LUNAR_DATES[selectedDate];

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 bg-zen-bg z-20 px-4 pb-3 shadow-sm">
                <div className="-mx-4 mb-2">
                    <div 
                        ref={dateScrollRef}
                        className="flex gap-[8px] overflow-x-auto no-scrollbar px-[16px] py-[4px] snap-x items-center relative"
                    >
                        {!searchTerm && (
                            <div 
                                className="absolute top-[4px] bottom-[4px] w-[52px] bg-[#464646] rounded-[16px] shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] z-0"
                                style={{ left: `${16 + currentIndex * (52 + 8)}px` }}
                            />
                        )}
                        {dates.map((date) => {
                            const d = new Date(date);
                            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                            const dayNum = d.getDate();
                            const isSelected = date === selectedDate && !searchTerm;
                            return (
                                <button
                                    key={date}
                                    onClick={() => setSelectedDate(date)}
                                    className="snap-center flex-shrink-0 flex flex-col items-center justify-center w-[52px] h-[72px] rounded-[16px] transition-all duration-300 relative z-10 group"
                                >
                                    <div className={`absolute inset-0 bg-white rounded-[16px] shadow-sm transition-all duration-300 -z-10 group-hover:bg-gray-50 ${isSelected ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}></div>
                                    <span className={`text-[9px] font-black tracking-widest mb-1 font-sans z-10 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-400'}`}>{dayName}</span>
                                    <span className={`text-[20px] font-bold font-sans leading-none z-10 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-400'}`}>{dayNum}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
                
                {!searchTerm ? (
                    <div className="flex justify-between items-end px-2 relative animate-fade-in">
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Day Plan</div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-mono font-bold text-zen-text leading-none">{selectedDate}</h2>
                                {lunarText && (
                                    <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm tracking-widest flex items-center gap-1">
                                        <i className="fa-solid fa-star text-[8px]"></i>
                                        <span>{lunarText}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                                <i className="fa-solid fa-location-dot text-zen-primary"></i> 
                                <span>{getLocationInfo(selectedDate)}</span>
                            </div>
                        </div>
                        <div className="bg-white/30 backdrop-blur-xl border border-white/40 p-3 rounded-2xl shadow-lg flex flex-col items-center justify-center min-w-[80px] h-[82px] box-border z-10 relative">
                            {loadingWeather ? (
                                <i className="fa-solid fa-spinner fa-spin text-gray-300 text-2xl"></i>
                            ) : (
                                <>
                                    <div className="text-2xl mb-1 h-8 flex items-center justify-center filter drop-shadow-sm">
                                        {weather.condition === 'sunny' && <i className="fa-solid fa-sun text-orange-400 animate-spin-slow"></i>}
                                        {weather.condition === 'cloudy' && <i className="fa-solid fa-cloud text-gray-400"></i>}
                                        {weather.condition === 'rain' && <i className="fa-solid fa-cloud-rain text-blue-400"></i>}
                                        {weather.condition === 'snow' && <i className="fa-regular fa-snowflake text-blue-200"></i>}
                                    </div>
                                    <div className="text-sm font-bold font-mono h-5 flex items-center text-gray-700">{weather.temp}°C</div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="px-2 animate-fade-in">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Search Results</div>
                        <div className="text-xl font-bold text-zen-text">找到了 {filteredItems.length} 個行程</div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 no-scrollbar">
                {!searchTerm ? (
                    groupedItems[selectedDate]?.map(item => (
                        <ScheduleItemRow key={item.id} item={item} />
                    )) || (
                        <div className="text-center py-10 text-gray-400 opacity-60">
                            <i className="fa-regular fa-calendar-plus text-4xl mb-2"></i>
                            <p className="text-sm">No plans for this day yet.</p>
                        </div>
                    )
                ) : (
                    filteredItems.map(item => (
                        <ScheduleItemRow key={item.id} item={item} showDate={true} searchTerm={searchTerm} />
                    ))
                )}
            </div>
        </div>
    );
};

// --- BOOKINGS TAB ---
export const BookingsTab: React.FC = () => {
    return (
        <div className="h-full overflow-y-auto px-4 pt-4 pb-32 no-scrollbar">
             <div className="mb-8">
                <h2 className="text-2xl font-black text-stone-800 mb-1">傳送卷軸</h2>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Confirmed Bookings</p>
            </div>
            
            <Card className="border-l-4 border-l-indigo-500">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded mb-2 inline-block">Flight</span>
                        <h3 className="font-bold text-lg text-stone-800">阿聯酋航空 EK367</h3>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-stone-400 uppercase">Ref No.</span>
                        <p className="font-mono font-bold text-stone-700">RLP9XT</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                        <p className="text-xs text-stone-400 font-bold mb-1">DEPARTURE</p>
                        <p className="font-black text-stone-700">TPE 23:45</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-stone-400 font-bold mb-1">ARRIVAL</p>
                        <p className="font-black text-stone-700">DXB 05:40</p>
                    </div>
                </div>
                <Button variant="secondary" size="sm" className="w-full">
                    <i className="fa-solid fa-file-pdf"></i>
                    查看電子票券
                </Button>
            </Card>
        </div>
    );
};

// --- SUPPORT TAB ---
export const SupportTab: React.FC = () => {
    return (
        <div className="h-full overflow-y-auto px-4 pt-4 pb-32 no-scrollbar">
             <div className="mb-8">
                <h2 className="text-2xl font-black text-stone-800 mb-1">救助信號</h2>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Emergency & Support</p>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center">
                            <i className="fa-solid fa-phone-flip"></i>
                        </div>
                        <div>
                            <h3 className="font-black text-red-900">緊急求助 (捷克/奧地利)</h3>
                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Common Emergency</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};