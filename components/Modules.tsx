
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
      id: 'd0-1', date: '2026-02-14', time: '21:30', displayTime: '??:??',
      title: '召喚小隊', enTitle: 'Quest Starts', location: 'TPE 桃園機場', category: '集合', categoryColor: 'teal',
      description: '冒險者大廳\n(桃園機場｜第O航廈｜OO櫃檯旁)',
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

  // --- 2/16 (Mon) Day 2: Prague ---
  { 
      id: 'd2-1', date: '2026-02-16', time: '09:00', 
      title: '查理士大橋', enTitle: 'Charles Bridge', location: '伏爾塔瓦河 (Vltava)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/KHgBnM7yiGxodwn86',
      guideInfo: {
          story: "這座橋是捷克最著名的地標，始建於一三五七年，由查理四世皇帝奠基（傳說他當時諮詢了天文學家，選擇了一三五七年九月七日五點三十一分這個「迴文」吉時）。",
          tip: "找到雕像底座的兩塊青銅浮雕（一塊描繪聖約翰被丟下河，塊是騎士與狗），據說觸摸它們會帶來好運，並確保您能再次回到布拉格。",
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
          story: "這不只是一座城堡，而是金氏世界紀錄認證的「世界上最大的古堡建築群」。\n\n這裡曾是波希米亞國王與神聖羅馬帝國皇帝的居所，集結了羅馬式、哥德式、文藝復興至巴洛克等千年的建築精華。\n\n城堡的心臟是「聖維特大教堂」(St. Vitus Cathedral)，這座耗時近 600 年才完工的哥德式傑作，不僅是歷代國王加冕之處，更是捷克精神的英恆象徵。",
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

  // --- 2/17 (Tue) Day 3: Prague ---
  { 
      id: 'd3-1', date: '2026-02-17', time: '09:00', 
      title: '捷克郵政總局', enTitle: 'Czech Post Office', location: '布拉格新城 (Nové Město)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/hCSgxbBEBKxW1FXr8',
      guideInfo: {
          story: "建於1871-1874年，採用宏偉的新文藝復興風格。內部有表現通訊歷史的壁畫。",
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
          tip: "從博物館頂樓的圓頂可以俯瞰整個瓦茨拉夫廣場。主館與新館（原國會大廈）有地下通道相連。",
          highlights: [
              { id: 'h1', text: '圓頂景觀', color: 'blue' },
              { id: 'h2', text: '國家認同', color: 'red' }
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
          story: "庫倫洛夫舊城區在1992年被聯合國教科文組織列為世界文化遺產，被譽為「中世紀的完美縮影」。漫步在完整保留十四至十七世紀建築風貌的巷弄間，彷彿時光倒流，置身於輝煌的文藝復興時期。",
          tip: "舊城區內幾乎禁止車輛通行，步行方式最佳。除了城堡，拉特蘭街 (Latrán) 也有許多絕佳拍照點。",
          highlights: [
              { id: 'h1', text: '世界遺產', color: 'blue' },
              { id: 'h2', text: '步行天堂', color: 'green' }
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
      title: '鹽礦探秘之旅', enTitle: 'Salt Mine Tour', location: '哈萊認 (Hallein) /貝希特斯加登', category: '區域解鎖', categoryColor: 'red',
      mapUrl: 'https://maps.app.goo.gl/khDxgJfHDWY6TwhU6',
      guideInfo: {
          story: "「鹽」是中世紀的白金.此區財富均來自鹽礦。",
          tip: "需換上傳統礦工服。體驗亮點是兩段刺激的木製溜滑梯，以及搭乘木筏渡過地底鹽水湖。",
          highlights: [
              { id: 'h1', text: '木製溜滑梯', color: 'orange' },
              { id: 'h2', text: '礦工服', color: 'gray' },
              { id: 'h3', text: '地底鹽湖', color: 'blue' }
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
      id: 'd7-3', date: '2026-02-21', time: '15:00', 
      title: '卡爾教堂', enTitle: 'Karlskirche', location: '卡爾廣場 (Karlsplatz)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/FMdKhrTT6ye6FD388',
      guideInfo: {
          story: "巴洛克建築巔峰，1713年皇帝卡爾六世為感謝黑死病結束而建.融合了官希臘的神殿門廊、古羅馬的兩根「圖拉真柱」（上面雕刻著聖人的生平）以及拜占庭式的巨大橢圓形穹頂。",
          tip: "前方水池可拍出完美倒影。教堂內部有全景電梯可直達穹頂近距離欣賞濕壁畫（需購票）。",
          highlights: [
              { id: 'h1', text: '巴洛克', color: 'orange' },
              { id: 'h2', text: '穹頂電梯', color: 'blue' }
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
          tip: "兩側矗立著「雙胞胎」建築：藝術史博物館與自然史博物館。後方即是現代化的維也納博物館區 (MQ)。",
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
          story: "哈布斯堡王朝的冬宮，也是西西 (Sisi，伊莉莎白皇后) 的黃金牢籠。\n\n西西 (Sisi) 是伊莉莎白皇后的真實暱稱，茜茜則是電影譯名。\n霍夫堡宮是西西皇后權力的象徵，也是她痛苦的根源。在這裡看到的不是一個幸福皇後的家，而是一位女性試圖在壓抑體制中，衝撞並尋找自我的掙扎痕跡。",
          tip: "參觀重點包含西西博物館、皇家公寓與銀器收藏館。西班牙馬術學校也位於此區。\n\n＊西西 (Sisi) 皇後的關鍵展品\n私個人物品： 西西皇後的梳妝用具、體操器材、旅行藥箱。\n著名禮服： 重現了她著名的匈牙利加冕禮服複製件。\n死亡證明： 展示了她在日內瓦遇刺時的相關文件與黑色的喪服（兒子自殺後她只穿黑衣）。",
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
          tip: "位於步行街中央的露天雕塑。紀念柱的最頂端是「聖三一」（父、子、聖靈），中間是皇帝利奧波德一世跪地祈禱的雕像，底座則是象蹤瘟疫的女巫。\n\n＊可至附近的德梅爾咖啡店（Café Demel）購買維也納知名甜點「糖漬紫羅蘭 Candied Violets」。",
          highlights: [
              { id: 'h1', text: '聖三一', color: 'orange' },
              { id: 'h2', text: '巴洛克雕塑', color: 'gray' },
              { id: 'h3', text: '糖漬紫羅蘭', color: 'purple' }
          ],
          relatedLink: {
              text: "Café Demel",
              url: "https://maps.app.goo.gl/jj2MoyzjczhqNUCJ8"
          }
      }
  },
  { 
      id: 'd8-4', date: '2026-02-22', time: '14:00', 
      title: '熊布朗宮 (美泉宮)', enTitle: 'Schönbrunn Palace', location: '維也納第13區 (Hietzing)', category: '區域解鎖', categoryColor: 'red',
      description: 'Schönbrunn Palace',
      mapUrl: 'https://maps.app.goo.gl/nommjbpqLek8AkKL6',
      guideInfo: {
          story: "1996年列為世界文化遺產.此處原為皇家狩獵小屋，後經瑪麗亞·特蕾莎女皇（歐洲丈母娘）改建為巴洛克式宮殿。\n\n這裡曾是6歲神童莫札特演奏之地，也是末代皇帝卡爾一世簽署放棄權力文件、終結帝國統治的歷史現場。",
          tip: "購票：參觀宮殿內部必須購票（如 Imperial Tour 或 Grand Tour），強烈建議「提早上網預訂」。\n花園：宮殿後方的法式花園是免費開放的。\n凱旋門：務必爬上花園對面的山丘，抵達「凱旋門」，那是俯瞰全景的「最佳地點」。\n動物園：世界上現存最古老的動物園也位於此。",
          highlights: [
              { id: 'h0', text: '夏宮', color: 'blue' },
              { id: 'h3', text: '世界文化遺產', color: 'red' },
              { id: 'h1', text: '凱旋門觀景', color: 'orange' },
              { id: 'h2', text: '神童莫札特', color: 'purple' },
              { id: 'h4', text: '最古老動物園', color: 'green' }
          ]
      }
  },

  // --- 2/23 (Mon) Day 9: Vienna ---
  { 
      id: 'd9-1', date: '2026-02-23', time: '09:00', 
      title: '百水公寓', enTitle: 'Hundertwasser House', location: '維也納第3區 (Landstraße)', category: '登錄地圖', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/dcfSuaNqNjkhTEJp6',
      guideInfo: {
          story: "這座公寓於 1985 年完工，是由奧地利身兼藝術家與建築師雙重身分的「百水先生」(Friedensreich Hundertwasser) 所設計，堪稱維也納建築界獨樹一幟的異數。\n\n百水先生極度痛恨「直線」，甚至稱其為「邪惡的產物」；相反地，他推崇回歸自然與有機的形態。這座公寓，正是他將這些反骨理念付諸實踐的集大成之作。",
          tip: "若上次未參觀百水藝術館，今日可安排前往，欣賞更多百水先生的畫作與建築模型。",
          highlights: [
              { id: 'h1', text: '自然共生', color: 'green' },
              { id: 'h2', text: '藝術巡禮', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd9-2', date: '2026-02-23', time: '10:00', 
      title: '聖史帝芬教堂', enTitle: "St. Stephen's Cathedral", location: '史蒂芬廣場 (Stephansplatz)', category: '區域解鎖', categoryColor: 'red',
      description: '(南塔、北塔二擇一登頂)',
      mapUrl: 'https://maps.app.goo.gl/d6ob7ph5DwFvTL949',
      guideInfo: {
          story: "維也納的靈魂象測，始建於12世紀.曾在二戰末期的1945年幾乎被大火燒毀並重建。\n\n身體 (Body) → 嘉布遣會教堂 (Kapuzinerkirche)\n心臟 (Heart) → 奧古斯丁教堂 (Augustinerkirche)\n內臟 (Viscera) → 聖史帝芬教堂 (Stephansdom)",
          tip: "南塔需爬343階樓梯但景色最佳；北塔有電梯可看普默林大鐘。亦可參加導覽參觀存放著哈布斯堡王朝早期成員內臟的地下墓穴。\n\n＊可至附近的德梅爾咖啡店（Café Demel）購買維也納知名甜點「糖漬紫羅蘭 Candied Violets」。",
          highlights: [
              { id: 'h1', text: '南塔(樓梯)', color: 'red' },
              { id: 'h2', text: '北塔(電梯)', color: 'blue' },
              { id: 'h3', text: '地下墓穴', color: 'gray' },
              { id: 'h4', text: '糖漬紫羅蘭', color: 'purple' }
          ],
          relatedLink: {
              text: "Café Demel",
              url: "https://maps.app.goo.gl/9d1vrMbcqkoDpHqb6"
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
      description: '抵達溫暖的家',
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
 * 針對特定的世界遺產與地標進行更精確的 Icon 分類
 * 回傳完整類別字串，包含 fa-solid 或 fa-brands 等前綴
 */
const getCategoryIcon = (item: ScheduleItem): string => {
    const title = item.title;
    
    // --- 特定核心地標優先精準適配 ---
    if (title.includes('布拉格古堡')) return 'fa-solid fa-chess-rook';
    if (title.includes('庫倫洛夫城堡')) return 'fa-brands fa-fort-awesome'; 
    if (title.includes('米拉貝爾花園')) return 'fa-solid fa-music';
    if (title.includes('莎姿堡城堡')) return 'fa-solid fa-tower-observation'; // 重新設計：要塞暸望塔形象，呼應高處位置與纜車體驗
    
    // 其他特定地標與活動
    if (title.includes('國王湖') || title.includes('遊船')) return 'fa-solid fa-ship';
    if (title.includes('鹽礦')) return 'fa-solid fa-gem';
    if (title.includes('天文鐘')) return 'fa-solid fa-clock';
    if (title.includes('黃金小徑')) return 'fa-solid fa-person-walking';
    if (title.includes('購物') || title.includes('Outlet')) return 'fa-solid fa-bag-shopping';
    
    // 建築物類型通用細分
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
    
    // 任務與傳送分類基礎適配
    if (item.category === '抵達') return 'fa-solid fa-trophy';
    if (item.title.includes('召喚')) return 'fa-solid fa-hat-wizard';
    if (item.category === '集合') return 'fa-solid fa-dragon';
    if (item.category === '起飛') return 'fa-solid fa-plane-up';
    if (item.category === '降落') return 'fa-solid fa-plane-arrival';
    if (item.category === '轉機') return 'fa-solid fa-shuffle';
    if (item.category === '區域解鎖') return 'fa-solid fa-unlock-keyhole';
    if (item.category === '登錄地圖') return 'fa-solid fa-map-location-dot';
    
    if (item.category === 'transport') return 'fa-solid fa-train-subway';
    if (title.includes('花園') || title.includes('湖')) return 'fa-solid fa-tree';
    if (item.category === '座標登錄') return 'fa-solid fa-camera-retro';
    
    return 'fa-solid fa-location-dot';
};

const ScheduleItemRow: React.FC<{ item: ScheduleItem; showDate?: boolean; searchTerm?: string }> = ({ item, showDate, searchTerm = '' }) => {
    // 交通與特定重大類別顯示大時間
    const isMajor = ['transport', '集合', '起飛', '降落', '轉機', '抵達'].includes(item.category);
    
    const timeStr = item.displayTime || item.time;
    const [mainTime, subTime] = timeStr.includes('\n') ? timeStr.split('\n') : [timeStr, null];
    const [hour, minute] = mainTime.split(':');
    const iconClasses = getCategoryIcon(item);

    return (
        <div className="relative mb-2 flex gap-0 group">
            <div className="w-12 py-4 flex flex-col items-end justify-start flex-shrink-0 pr-2">
                {isMajor ? (
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
                        ${isMajor || ['區域解鎖', '登錄地圖'].includes(item.category)
                            ? `w-8 h-8 ${NODE_TEXT_COLORS[item.categoryColor || 'gray']} border-current shadow-sm bg-white` 
                            : `w-7 h-7 text-stone-400 border-stone-300 bg-white`
                        }
                    `}
                >
                    <i className={`${iconClasses} text-[10px]`}></i>
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
                        {item.businessHours && (
                            <div className="text-[10px] font-bold text-orange-400 bg-orange-50 px-2 py-0.5 rounded inline-block mb-1">
                                <i className="fa-regular fa-clock mr-1"></i>營業時間: {item.businessHours}
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DATE_ITEM_WIDTH = 52;
const DATE_ITEM_GAP = 8;
const DATE_CONTAINER_PADDING = 16;

export const ScheduleTab: React.FC<{ searchTerm?: string }> = ({ searchTerm = '' }) => {
  const [selectedDate, setSelectedDate] = useState('2026-02-14');
  const [items] = useState(MOCK_SCHEDULE);
  const [weather, setWeather] = useState<WeatherInfo>({ condition: 'cloudy', temp: 5, locationName: '布拉格' });
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dateScrollRef = useRef<HTMLDivElement>(null);
  const dates = useMemo(() => Array.from(new Set(items.map(i => i.date))).sort() as string[], [items]);
  const currentIndex = dates.indexOf(selectedDate);

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase();
    
    return items.filter(item => {
        const basicMatch = 
            item.title.toLowerCase().includes(query) ||
            item.enTitle?.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query);

        if (basicMatch) return true;

        if (item.guideInfo) {
            const storyMatch = typeof item.guideInfo.story === 'string' && 
                               item.guideInfo.story.toLowerCase().includes(query);
            const tipMatch = item.guideInfo.tip?.toLowerCase().includes(query);
            const highlightMatch = item.guideInfo.highlights?.some(h => h.text.toLowerCase().includes(query));
            return storyMatch || tipMatch || highlightMatch;
        }

        return false;
    });
  }, [searchTerm, items]);

  useLayoutEffect(() => {
    if (currentIndex >= 0 && scrollRefs.current[currentIndex]) {
        scrollRefs.current[currentIndex]!.scrollTo(0, 0);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (dateScrollRef.current) {
        const index = dates.indexOf(selectedDate);
        if (index >= 0) {
            const container = dateScrollRef.current;
            const itemCenter = DATE_CONTAINER_PADDING + index * (DATE_ITEM_WIDTH + DATE_ITEM_GAP) + DATE_ITEM_WIDTH / 2;
            const containerCenter = container.clientWidth / 2;
            const scrollLeft = itemCenter - containerCenter;
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }
  }, [selectedDate, dates]);

  const getLocationInfo = (date: string) => {
      if (date === '2026-02-14') return '台灣 Taiwan';
      if (date >= '2026-02-15' && date <= '2026-02-19') return '捷克 Czech Republic';
      if (date === '2026-02-20') return '德國 Germany';
      if (date >= '2026-02-21' && date <= '2026-02-24') return '奧地利 Austria';
      return '歐洲 Europe';
  };

  const locationHeader = getLocationInfo(selectedDate);
  const lunarText = LUNAR_DATES[selectedDate];

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
  
  const onTouchStart = (e: React.TouchEvent) => {
    if (searchTerm) return; 
    setTouchEnd(null);
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (searchTerm) return;
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    if (Math.abs(distanceX) > Math.abs(distanceY) && Math.abs(distanceX) > 50) {
       if (distanceX > 0 && currentIndex < dates.length - 1) {
           setSelectedDate(dates[currentIndex + 1]);
       } else if (distanceX < 0 && currentIndex > 0) {
           setSelectedDate(dates[currentIndex - 1]);
       }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 bg-zen-bg z-20 px-4 pb-3 shadow-sm">
          <div className="-mx-4 mb-2">
              <div 
                ref={dateScrollRef}
                className="flex gap-[8px] overflow-x-auto no-scrollbar px-[16px] py-[4px] snap-x items-center relative"
              >
                <div 
                    className={`absolute top-[4px] bottom-[4px] w-[52px] bg-[#464646] rounded-[16px] shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] z-0 ${currentIndex === -1 || searchTerm ? 'opacity-0' : 'opacity-100'}`}
                    style={{ left: `${DATE_CONTAINER_PADDING + (currentIndex === -1 ? 0 : currentIndex) * (DATE_ITEM_WIDTH + DATE_ITEM_GAP)}px` }}
                />
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
                      <span>{locationHeader}</span>
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
                <div className="text-xl font-bold text-zen-text">找到了 {filteredResults.length} 個行程</div>
            </div>
          )}
      </div>

      <div 
        className="flex-1 overflow-hidden relative w-full touch-pan-y"
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      >
         {!searchTerm ? (
            <div className="flex h-full transition-transform duration-300 ease-out will-change-transform" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {dates.map((date, idx) => {
                    const dayItems = items.filter(i => i.date === date);
                    return (
                        <div key={date} ref={el => { scrollRefs.current[idx] = el; }} className="w-full h-full flex-shrink-0 overflow-y-auto no-scrollbar px-4 pb-24">
                            <div className="relative pt-4">
                                {dayItems.map((item) => <ScheduleItemRow key={item.id} item={item} />)}
                                {dayItems.length === 0 && (
                                    <div className="text-center py-10 text-gray-400 opacity-60">
                                        <i className="fa-regular fa-calendar-plus text-4xl mb-2"></i>
                                        <p className="text-sm">No plans for this day yet。</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
         ) : (
            <div className="w-full h-full overflow-y-auto no-scrollbar px-4 pb-24 animate-fade-in-up">
                <div className="relative pt-4">
                    {filteredResults.length > 0 ? (
                        filteredResults.map((item) => (
                            <ScheduleItemRow key={item.id} item={item} showDate={true} searchTerm={searchTerm} />
                        ))
                    ) : (
                        <div className="text-center py-20 text-stone-400 opacity-60">
                            <i className="fa-solid fa-ghost text-6xl mb-4 animate-bounce"></i>
                            <p className="text-sm font-bold px-8">冒險者公會的情報網裡沒聽說過這地方耶？</p>
                            <p className="text-xs mt-1">請嘗試輸入其他線索⋯⋯</p>
                        </div>
                    )}
                </div>
            </div>
         )}
      </div>
    </div>
  );
};

export const SupportTab: React.FC = () => {
    return (
        <div className="h-full flex flex-col bg-zen-bg">
            {/* Frozen Header */}
            <div className="flex-shrink-0 px-5 pt-4 pb-3 bg-zen-bg/80 backdrop-blur-md border-b border-zen-primary/10 z-20">
                <div className="flex items-center gap-3 px-1">
                    <div className="w-10 h-10 rounded-2xl bg-white border-2 border-zen-primary/20 flex items-center justify-center shadow-zen-sm transform -rotate-3 flex-shrink-0">
                        <i className="fa-solid fa-shield-heart text-zen-primary text-lg"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-zen-text leading-tight tracking-tight">冒險者緊急救助</h2>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">EMERGENCY ASSISTANCE</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-32 pt-5 space-y-8 no-scrollbar animate-fade-in">
                <div className="space-y-10">
                    {/* Czech Republic Card */}
                    <div className="relative group">
                        <div className="absolute -top-3 -left-2 z-20 bg-white border border-stone-200 px-3 py-1 rounded-full shadow-sm flex items-center gap-2 transform -rotate-2">
                            <span className="text-sm">🇨🇿</span>
                            <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">捷克分部</span>
                        </div>
                        <Card className="p-0 overflow-hidden border-2 border-stone-100/50 bg-white/80 backdrop-blur-sm">
                            <div className="p-6 pt-8 space-y-5">
                                <div className="flex flex-col">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[9px] font-black text-zen-primary uppercase tracking-widest flex items-center gap-1.5">
                                            <i className="fa-solid fa-map-pin text-[8px]"></i> 公會座標 Coordinates
                                        </span>
                                        <a 
                                            href="https://maps.app.goo.gl/RUG3WXz5bVJoGWHo8"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-[10px] font-bold text-stone-500 hover:bg-zen-primary/10 hover:text-zen-primary transition-colors border border-stone-200/60 shadow-sm"
                                        >
                                            <i className="fa-solid fa-diamond-turn-right"></i>
                                            <span>導航</span>
                                        </a>
                                    </div>
                                    <p className="text-xs text-zen-text font-bold leading-relaxed pl-3 border-l-2 border-zen-primary/20">
                                        Evropska 2590/33c, 160 00 Praha 6, Czech Republic
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-zen-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <i className="fa-solid fa-phone text-[8px]"></i> 傳送專線 Phone
                                        </span>
                                        <div className="flex flex-wrap gap-2 pl-3 border-l-2 border-zen-primary/20">
                                            <a href="tel:+420233320606" className="text-xs font-mono font-black text-stone-600 bg-stone-100 px-2 py-1 rounded">+420 233-320-606</a>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-zen-danger uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <i className="fa-solid fa-heart-pulse text-[8px]"></i> 緊急救助專線 Emergency
                                        </span>
                                        <div className="flex flex-wrap gap-2 pl-3 border-l-2 border-zen-danger/20">
                                            <a href="tel:+420603166707" className="text-xs font-mono font-black text-zen-danger bg-red-50 px-2 py-1 rounded border border-red-100 shadow-sm transition-all active:scale-95">境外：+420 603-166-707</a>
                                            <a href="tel:603166707" className="text-xs font-mono font-black text-zen-danger bg-red-50 px-2 py-1 rounded border border-red-100 shadow-sm transition-all active:scale-95">境內直撥：603-166-707</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-dashed border-stone-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <i className="fa-solid fa-hourglass-start text-[10px] text-stone-400"></i>
                                        <span className="text-[10px] font-bold text-stone-500">領務時間：週一～週五 09:30–11:30、13:30–16:30</span>
                                    </div>
                                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-100/50">
                                        <div className="flex gap-2">
                                            <i className="fa-solid fa-feather-pointed text-zen-primary mt-0.5 text-xs"></i>
                                            <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
                                                這就像「大使館」一樣的台灣代表機構，可協助急難救助、護照補發、遺失證件協助等。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Germany Card */}
                    <div className="relative group">
                        <div className="absolute -top-3 -left-2 z-20 bg-white border border-stone-200 px-3 py-1 rounded-full shadow-sm flex items-center gap-2 transform -rotate-2">
                            <span className="text-sm">🇩🇪</span>
                            <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">德國總部</span>
                        </div>
                        <Card className="p-0 overflow-hidden border-2 border-stone-100/50 bg-white/80 backdrop-blur-sm">
                            <div className="p-6 pt-8 space-y-5">
                                <div className="flex flex-col">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[9px] font-black text-zen-primary uppercase tracking-widest flex items-center gap-1.5">
                                            <i className="fa-solid fa-location-arrow text-[8px]"></i> 座標 Coordinates
                                        </span>
                                        <a 
                                            href="https://maps.app.goo.gl/7XJr4SGCjofJBKmY6"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-[10px] font-bold text-stone-500 hover:bg-zen-primary/10 hover:text-zen-primary transition-colors border border-stone-200/60 shadow-sm"
                                        >
                                            <i className="fa-solid fa-diamond-turn-right"></i>
                                            <span>導航</span>
                                        </a>
                                    </div>
                                    <p className="text-xs text-zen-text font-bold leading-relaxed pl-3 border-l-2 border-zen-primary/20">
                                        Markgrafenstrasse 35, 10117 Berlin, Germany
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-zen-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <i className="fa-solid fa-phone text-[8px]"></i> 傳送專線 Phone
                                        </span>
                                        <div className="flex pl-3 border-l-2 border-zen-primary/20">
                                            <a href="tel:+4930203610" className="text-xs font-mono font-black text-stone-600 bg-stone-100 px-2 py-1 rounded">+49-30-203610</a>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-zen-danger uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <i className="fa-solid fa-heart-pulse text-[8px]"></i> 緊急救助專線 Emergency
                                        </span>
                                        <div className="flex pl-3 border-l-2 border-zen-danger/20">
                                            <a href="tel:+491713898257" className="text-xs font-mono font-black text-zen-danger bg-red-50 px-2 py-1 rounded border border-red-100 shadow-sm transition-all active:scale-95">+49-171-3898257</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-dashed border-stone-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <i className="fa-solid fa-hourglass-start text-[10px] text-stone-400"></i>
                                        <span className="text-[10px] font-bold text-stone-500">領務時間：週一～週五 09:00–12:30、14:00–17:00</span>
                                    </div>
                                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-100/50">
                                        <div className="flex gap-2">
                                            <i className="fa-solid fa-scroll text-stone-400 mt-0.5 text-xs"></i>
                                            <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
                                                如果你在德國其他城市（例如希特斯加登），可先聯絡柏林總處，他們會指引最近的分辦事處。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Austria Card */}
                    <div className="relative group">
                        <div className="absolute -top-3 -left-2 z-20 bg-white border border-stone-200 px-3 py-1 rounded-full shadow-sm flex items-center gap-2 transform -rotate-1">
                            <span className="text-sm">🇦🇹</span>
                            <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">奧地利分部</span>
                        </div>
                        <Card className="p-0 overflow-hidden border-2 border-stone-100/50 bg-white/80 backdrop-blur-sm">
                            <div className="p-6 pt-8 space-y-5">
                                <div className="flex flex-col">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[9px] font-black text-zen-primary uppercase tracking-widest flex items-center gap-1.5">
                                            <i className="fa-solid fa-anchor text-[8px]"></i> 座標 Coordinates
                                        </span>
                                        <a 
                                            href="https://maps.app.goo.gl/6WjwL37Gt4DqphaN9"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-[10px] font-bold text-stone-500 hover:bg-zen-primary/10 hover:text-zen-primary transition-colors border border-stone-200/60 shadow-sm"
                                        >
                                            <i className="fa-solid fa-diamond-turn-right"></i>
                                            <span>導航</span>
                                        </a>
                                    </div>
                                    <p className="text-xs text-zen-text font-bold leading-relaxed pl-3 border-l-2 border-zen-primary/20">
                                        Wagramer Strasse 19/11. OG, A-1220 Vienna, Austria
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-zen-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <i className="fa-solid fa-phone text-[8px]"></i> 傳送專線 Phone
                                        </span>
                                        <div className="flex pl-3 border-l-2 border-zen-primary/20">
                                            <a href="tel:+4312124720" className="text-xs font-mono font-black text-stone-600 bg-stone-100 px-2 py-1 rounded">+43-1-2124720</a>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-zen-danger uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <i className="fa-solid fa-heart-pulse text-[8px]"></i> 緊急救助專線 Emergency
                                        </span>
                                        <div className="flex flex-wrap gap-2 pl-3 border-l-2 border-zen-danger/20">
                                            <a href="tel:+436643450455" className="text-xs font-mono font-black text-zen-danger bg-red-50 px-2 py-1 rounded border border-red-100 shadow-sm transition-all active:scale-95">+43-664-345-0455</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-dashed border-stone-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <i className="fa-solid fa-clock text-[10px] text-stone-400"></i>
                                        <span className="text-[10px] font-bold text-stone-500">領務時間：週一 ~ 週五 09:00-17:00</span>
                                    </div>
                                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-100/50">
                                        <div className="flex gap-2">
                                            <i className="fa-solid fa-shield-halved text-zen-primary mt-0.5 text-xs"></i>
                                            <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
                                                協助急難救援、護照、文件公證等主要代表機構。
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    type: 'flight',
    title: 'TPE - DXB',
    subTitle: 'EK367 - 阿聯酋航空',
    referenceNo: 'QUEST-EK367',
    date: '2026-02-15',
    time: '00:20',
    details: {
      '飛行時間': '9小時 25分',
      '抵達': '06:15'
    },
    status: 'confirmed'
  },
  {
    id: 'b2',
    type: 'flight',
    title: 'DXB - PRG',
    subTitle: 'EK139 - 阿聯酋航空',
    referenceNo: 'QUEST-EK139',
    date: '2026-02-15',
    time: '08:40',
    details: {
      '飛行時間': '6小時 50分',
      '抵達': '12:30',
      '備註': '轉機航班'
    },
    status: 'confirmed'
  },
  {
    id: 'b3',
    type: 'flight',
    title: 'VIE - DXB',
    subTitle: 'EK126 - 阿聯酋航空',
    referenceNo: 'QUEST-EK126',
    date: '2026-02-23',
    time: '21:45',
    details: {
      '飛行時間': '5小時 40分',
      '抵達': '06:25 (+1)'
    },
    status: 'confirmed'
  },
  {
    id: 'b4',
    type: 'flight',
    title: 'DXB - TPE',
    subTitle: 'EK366 - 阿聯酋航空',
    referenceNo: 'QUEST-EK366',
    date: '2026-02-24',
    time: '08:45',
    details: {
      '飛行時間': '8小時 55分',
      '抵達': '20:40',
      '備註': '轉機航班'
    },
    status: 'confirmed'
  }
];

const CITY_NAMES: Record<string, string> = {
    'TPE': 'Taipei',
    'DXB': 'Dubai',
    'PRG': 'Prague',
    'VIE': 'Vienna'
};

const getArrivalDate = (baseDate: string, arrivalStr: string | undefined) => {
    if (!arrivalStr) return baseDate;
    if (arrivalStr.includes('+1')) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    }
    return baseDate;
};

export const BookingsTab: React.FC = () => {
    const [bookings] = useState<Booking[]>(MOCK_BOOKINGS);

    return (
        <div className="h-full flex flex-col bg-zen-bg">
            {/* Frozen Header */}
            <div className="flex-shrink-0 px-5 pt-4 pb-3 bg-zen-bg/80 backdrop-blur-md border-b border-zen-primary/10 z-20">
                <div className="flex items-center gap-3 px-1">
                    <div className="w-10 h-10 rounded-full bg-zen-primary/10 border border-zen-primary/30 flex items-center justify-center shadow-zen-sm flex-shrink-0">
                        <i className="fa-solid fa-scroll text-zen-primary"></i>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-zen-text leading-tight tracking-tight">冒險者傳送日誌</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Teleportation Archive</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-32 pt-5 space-y-8 no-scrollbar bg-zen-bg animate-fade-in">
                <div className="space-y-8">
                    {bookings.map((booking) => {
                        const isTransfer = booking.details['備註'] === '轉機航班';
                        const accentColor = isTransfer ? 'bg-indigo-500' : 'bg-zen-primary';
                        const originCode = booking.title.split(' - ')[0];
                        const destCode = booking.title.split(' - ')[1];

                        return (
                            <div key={booking.id} className="relative group">
                                <i className="fa-solid fa-dharmachakra absolute -top-1 -left-1 text-[10px] text-zen-primary/30 z-20 group-hover:rotate-180 transition-transform duration-1000"></i>
                                <i className="fa-solid fa-dharmachakra absolute -top-1 -right-1 text-[10px] text-zen-primary/30 z-20 group-hover:rotate-180 transition-transform duration-1000"></i>
                                
                                <div className={`bg-white rounded-3xl shadow-zen border border-stone-100 relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-zen-hover`}>
                                    <div className={`h-2 w-full ${accentColor} opacity-70`}></div>
                                    
                                    <div className="px-5 py-4 flex justify-between items-center bg-stone-50/40 border-b border-stone-100">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-lg ${accentColor} flex items-center justify-center shadow-md transform -rotate-3`}>
                                                <i className="fa-solid fa-wand-magic-sparkles text-white text-[10px]"></i>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">傳送陣 ID</span>
                                                <span className="text-xs font-black text-zen-text font-mono tracking-tight leading-none">{booking.subTitle?.split(' - ')[0]}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {isTransfer && (
                                                <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border bg-indigo-50 border-indigo-100 text-indigo-400">
                                                    LAYOVER
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-center relative">
                                            <div className="flex flex-col z-10 w-24">
                                                <div className="text-[8px] font-black text-zen-primary mb-1 uppercase tracking-[0.15em] opacity-80">召喚座標</div>
                                                <div className="text-3xl font-mono font-black text-stone-700 leading-none tracking-tighter mb-1">
                                                    {booking.time}
                                                </div>
                                                <div className="text-[10px] font-bold text-stone-400 font-mono tracking-tight">{booking.date}</div>
                                                <div className="text-xl font-black text-stone-600 mt-1.5 tracking-widest leading-none">{originCode}</div>
                                                <div className="text-[10px] font-bold text-stone-400 tracking-wide mt-0.5 leading-none uppercase">{CITY_NAMES[originCode] || 'Realm'}</div>
                                            </div>

                                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-0">
                                                <div className="mb-2 flex items-center gap-1.5 px-3 py-0.5 bg-stone-50 rounded-full border border-stone-100 shadow-sm">
                                                     <i className="fa-regular fa-hourglass-half text-[8px] text-zen-primary/70 animate-pulse"></i>
                                                     <span className="text-[9px] font-mono font-black text-stone-500">{booking.details['飛行時間']}</span>
                                                </div>
                                                
                                                <div className="relative w-32 h-10 flex items-center justify-center">
                                                    <div className="absolute w-full h-[1px] bg-gradient-to-r from-stone-50 via-stone-200 to-stone-50"></div>
                                                    <div className="relative w-10 h-10 rounded-full bg-white border border-stone-100 shadow-zen-sm flex items-center justify-center z-10 animate-spin-slow">
                                                        <div className="absolute inset-0 rounded-full bg-zen-primary/5"></div>
                                                        <i className="fa-solid fa-dharmachakra text-stone-400 text-lg"></i>
                                                    </div>
                                                    <i className="fa-solid fa-bolt-lightning absolute text-[9px] text-zen-primary/60 animate-bounce top-[-12px]"></i>
                                                </div>
                                            </div>

                                            <div className="flex flex-col text-right z-10 w-24">
                                                <div className="text-[8px] font-black text-zen-primary mb-1 uppercase tracking-[0.15em] opacity-80">降落座標</div>
                                                <div className="text-3xl font-mono font-black text-stone-700 leading-none tracking-tighter mb-1">
                                                    {booking.details['抵達']?.split(' ')[0] || '--:--'}
                                                </div>
                                                <div className="text-[10px] font-bold text-stone-400 font-mono tracking-tight uppercase">
                                                    {getArrivalDate(booking.date, booking.details['抵達'])}
                                                </div>
                                                <div className="text-xl font-black text-stone-600 mt-1.5 tracking-widest leading-none">{destCode}</div>
                                                <div className="text-[10px] font-bold text-stone-400 tracking-wide mt-0.5 leading-none uppercase">{CITY_NAMES[destCode] || 'Realm'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-stone-50/50 px-6 py-3.5 border-t border-dashed border-stone-100 flex justify-between items-center relative">
                                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border border-stone-100 flex items-center justify-center shadow-sm">
                                            <i className="fa-solid fa-key text-[7px] text-stone-300"></i>
                                        </div>
                                        
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-gray-400 font-black tracking-widest uppercase mb-0.5">Hero Party</span>
                                            <span className="text-[11px] font-black text-stone-500 flex items-center gap-1.5">
                                                FAMILY ADVENTURERS
                                                <i className="fa-solid fa-crown text-[8px] text-zen-primary/40"></i>
                                            </span>
                                        </div>

                                        <div className="relative flex items-center gap-3">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[8px] text-gray-400 font-black tracking-widest uppercase mb-0.5">Teleport Code</span>
                                                <span className="text-[10px] font-mono font-black text-stone-600 bg-white px-1.5 py-0.5 rounded border border-stone-200 shadow-sm leading-none">
                                                    {booking.referenceNo}
                                                </span>
                                            </div>
                                            <div className="flex gap-[1.5px] opacity-20 group-hover:opacity-60 transition-opacity">
                                                {[1, 0, 1, 1, 0, 1, 0, 1].map((v, i) => (
                                                    <div key={i} className={`w-[1px] rounded-full bg-stone-700`} style={{ height: v ? '14px' : '8px' }}></div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="absolute -right-1 -bottom-1 w-14 h-14 pointer-events-none opacity-[0.05] transform -rotate-12 group-hover:scale-105 transition-transform duration-500">
                                            <div className="w-full h-full rounded-full border-2 border-red-800 flex items-center justify-center p-0.5">
                                                <div className="w-full h-full rounded-full border border-red-800 flex flex-col items-center justify-center leading-none">
                                                    <span className="text-[7px] font-black text-red-800 uppercase">Quest</span>
                                                    <span className="text-[9px] font-black text-red-800 uppercase">Passed</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
