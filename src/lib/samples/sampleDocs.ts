import { DocumentRecord } from '@/types';

export interface SampleDocConfig {
  id: string;
  title: string;
  type: 'txt';
  language: string;
  languageName: string;
  flag: string;
  level: string;
  description: string;
  totalPages: number;
  content: string;
}

export const SAMPLE_DOCUMENTS: SampleDocConfig[] = [
  {
    id: 'sample-es-principito',
    title: 'El Principito (Capítulo 1 y 2)',
    type: 'txt',
    language: 'es',
    languageName: 'Spanish',
    flag: '🇪🇸',
    level: 'Beginner - Intermediate',
    description: 'The beloved classic by Antoine de Saint-Exupéry in clear Spanish. Perfect for vocabulary acquisition.',
    totalPages: 3,
    content: `Capítulo 1: La boa y el sombrero

Pido perdón a los niños por haber dedicado este libro a una persona grande. Tengo una seria razón para ello: esta persona grande es el mejor amigo que tengo en el mundo. Tengo otra razón, además: esta persona grande puede comprender todo, hasta los libros para niños. Tengo una tercera razón: esta persona grande vive en Francia, donde tiene hambre y frío. Tiene verdadera necesidad de consuelo. Si todas estas razones no fueran suficientes, quiero dedicar este libro al niño que esta persona grande fue en otro tiempo. Todas las personas grandes han sido niños antes (pero pocas lo recuerdan). Corrijo, pues, mi dedicatoria: A León Werth, cuando era niño.

Cuando yo tenía seis años vi en un libro sobre la selva virgen que se titulaba "Historias vividas", una magnífica lámina. Representaba una serpiente boa que se tragaba a una fiera. El libro decía: "Las serpientes boas tragan sus presas enteras, sin masticarlas. Luego no pueden moverse y duermen durante los seis meses que dura su digestión".

Reflexioné mucho entonces sobre las aventuras de la selva y, a mi vez, logré trazar con un lápiz de color mi primer dibujo. Mi dibujo número 1 era así: enseñé mi obra de arte a las personas grandes y les pregunté si mi dibujo les daba miedo.
—¿Por qué habría de dar miedo un sombrero? —me respondieron.
Mi dibujo no representaba un sombrero. Representaba una serpiente boa que digería un elefante.

===PAGE_BREAK===

Capítulo 2: El encuentro en el desierto

Viví así, solo, sin nadie con quien hablar verdaderamente, hasta un aterrizaje forzoso en el desierto de Sahara, hace seis años. Algo se había roto en mi motor. Y como no llevaba conmigo ni mecánico ni pasajeros, me dispuse a realizar, solo, una difícil reparación. Era para mí una cuestión de vida o muerte. Tenía agua de beber apenas para ocho días.

La primera noche me dormí sobre la arena, a mil millas de toda tierra habitada. Estaba más aislado que un náufrago en una balsa en medio del océano. Imaginaos, pues, mi sorpresa cuando, al romper el día, me despertó una extraña vocecita que decía:
—Por favor... ¡dibújame un cordero!
—¿Eh?
—Dibújame un cordero...

Me puse en pie de un salto, como herido por el rayo. Me froté los ojos. Miré bien. Y vi un hombrecito extraordinario que me examinaba gravemente. Aquí está el mejor retrato que, más tarde, logré hacer de él. Pero mi dibujo, ciertamente, es mucho menos encantador que el modelo. No es culpa mía. Las personas grandes me desanimaron de mi carrera de pintor a la edad de seis años, y no había aprendido a dibujar nada, salvo las boas cerradas y las boas abiertas.

===PAGE_BREAK===

Capítulo 3: El secreto del Principito

Miré, pues, aquella aparición con los ojos redondos de asombro. No olvidéis que me encontraba a mil millas de toda región habitada. Ahora bien, el hombrecito no me parecía ni extraviado, ni muerto de fatiga, ni muerto de hambre, ni muerto de sed, ni muerto de miedo. No tenía en absoluto la apariencia de un niño perdido en medio del desierto, a mil millas de toda región habitada. Cuando logré por fin hablar, le dije:
—Pero... ¿qué haces tú aquí?
Y él me repitió entonces, muy suavemente, como una cosa muy seria:
—Por favor... dibújame un cordero...

Cuando el misterio es demasiado impresionante, no es posible desobedecer. Por absurdo que me pareciese a mil millas de todo lugar habitado y en peligro de muerte, saqué del bolsillo una hoja de papel y una estilográfica. Pero recordé entonces que yo había estudiado sobre todo geografía, historia, cálculo y gramática, y le dije al hombrecito (con un poco de mal humor) que no sabía dibujar. Me respondió:
—No importa. Dibújame un cordero.

Como nunca había dibujado un cordero, rehíce para él uno de los dos únicos dibujos que yo era capaz de hacer: el de la boa cerrada. Y quedé estupefacto al oír responder al hombrecito:
—¡No! ¡No! No quiero un elefante dentro de una boa. Una boa es muy peligrosa y un elefante es muy embarazoso. En mi casa todo es pequeño. Necesito un cordero. Dibújame un cordero.`,
  },
  {
    id: 'sample-fr-verne',
    title: 'Le Tour du Monde en 80 Jours',
    type: 'txt',
    language: 'fr',
    languageName: 'French',
    flag: '🇫🇷',
    level: 'Intermediate',
    description: 'Jules Verne’s timeless adventure masterpiece in classic French literary style.',
    totalPages: 2,
    content: `Chapitre I : Dans lequel Phileas Fogg et Passepartout s'acceptent réciproquement

En l'année 1872, la maison numéro 7 de Saville Row, Burlington Gardens — maison dans laquelle Sheridan mourut en 1814 —, était habitée par Phileas Fogg, esq., l'un des membres les plus singuliers et les plus remarqués du Reform Club de Londres, tout en semblant prendre à tâche de ne rien faire qui pût attirer l'attention.

À l'un des plus grands orateurs qui honorent l'Angleterre, succédait donc ce Phileas Fogg, personnage énigmatique, dont on ne savait rien, sinon que c'était un fort galant homme et l'un des plus beaux gentlemen de la haute société anglaise.

On disait qu'il ressemblait à Lord Byron — pour la tête, car il était irréprochable quant aux pieds —, mais un Byron à moustaches et à favoris, un Byron impassible, qui aurait vécu mille ans sans vieillir.

Était-il riche ? Incontestablement. Mais comment avait-il fait fortune ? C'est ce que les plus curieux ne pouvaient dire, et Mr. Fogg était le dernier auquel il convînt de s'adresser pour l'apprendre. En tout cas, il n'était avare de rien, mais sans prodigalité, car partout où il manquait un appoint pour une chose noble, utile ou généreuse, il l'apportait silencieusement et même anonymement.

===PAGE_BREAK===

Chapitre II : Le départ pour l'inconnu

Phileas Fogg avait quitté sa maison de Saville Row à onze heures et demie, et, après avoir posé cinq cent soixante-quinze fois son pied droit devant son pied gauche et cinq cent soixante-seize fois son pied gauche devant son pied droit, il arriva au Reform Club, vaste édifice élevé dans Pall Mall.

Il gagna aussitôt la salle à manger, dont les neuf fenêtres s'ouvraient sur un beau jardin aux arbres déjà dorés par l'automne. Là, il prit place à la table habituelle où son couvert l'attendait.

Son déjeuner se composait d'un hors-d'œuvre, d'un poisson bouilli relevé d'une sauce Reading de première qualité, d'un roastbeef écarlate flanqué de champignons, d'un gâteau farci de tiges de rhubarbe et de groseilles vertes, et d'un morceau de chester, le tout arrosé de quelques tasses de cet excellent thé, spécialement recueilli pour les offices du Reform Club.

À midi quarante-sept, ce gentleman se leva et se dirigea vers le grand salon, une somptueuse pièce ornée de peintures richement encadrées. Là, un garçon lui remit le Times non coupé, dont Phileas Fogg opéra le laborieux dépliage avec une sûreté d'yeux qui dénotait une grande habitude de cette difficile opération.`,
  },
  {
    id: 'sample-de-kafka',
    title: 'Die Verwandlung (Franz Kafka)',
    type: 'txt',
    language: 'de',
    languageName: 'German',
    flag: '🇩🇪',
    level: 'Intermediate - Advanced',
    description: 'The famous opening of Kafka’s Metamorphosis. Excellent for compound German nouns and syntax.',
    totalPages: 2,
    content: `Erster Abschnitt: Das Erwachen

Als Gregor Samsa eines Morgens aus unruhigen Träumen erwachte, fand er sich in seinem Bett zu einem ungeheuren Ungeziefer verwandelt. Er lag auf seinem panzerartig harten Rücken und sah, wenn er den Kopf ein wenig hob, seinen gewölbten, braunen, von bogenförmigen Versteifungen geteilten Bauch, auf dessen Höhe sich die Bettdecke, zum gänzlichen Niedergleiten bereit, kaum noch erhalten konnte. Seine vielen, im Vergleich zu seinem sonstigen Umfang kläglich dünnen Beine flimmerten ihm hilflos vor den Augen.

»Was ist mit mir geschehen?«, dachte er. Es war kein Traum. Sein Zimmer, ein richtiges, nur etwas zu kleines Menschenzimmer, lag ruhig zwischen den vier wohlbekannten Wänden. Über dem Tisch, auf dem eine Kollektion von Tuchmustern ausgebreitet war — Samsa war Reisender —, hing das Bild, das er vor kurzem aus einer illustrierten Zeitschrift ausgeschnitten und in einen hübschen, vergoldeten Rahmen getan hatte.

Gregors Blick richtete sich dann zum Fenster, und das trübe Wetter — man hörte Regentropfen auf das Fensterblech aufschlagen — machte ihn ganz melancholisch. »Wie wäre es, wenn ich noch ein wenig weiterschliefe und alle Narrheiten vergäße«, dachte er, aber das war gänzlich unausführbar, denn er war gewohnt, auf der rechten Seite zu schlafen, konnte sich aber in seinem gegenwärtigen Zustand nicht in diese Lage bringen.

===PAGE_BREAK===

Zweiter Abschnitt: Der Morgen des Handlungsreisenden

»Ach Gott«, dachte er, »was für einen anstrengenden Beruf habe ich gewählt! Tagaus, tagein auf der Reise. Die geschäftlichen Aufregungen sind viel größer als im eigentlichen Geschäft zu Hause, und außerdem ist mir noch diese Plage des Reisens auferlegt, die Sorgen um die Zuganschlüsse, das unregelmäßige, schlechte Essen, ein immer wechselnder, nie andauernder, nie herzlich werdender menschlicher Verkehr. Der Teufel soll das alles holen!«

Er fühlte ein leichtes Jucken oben auf dem Bauch; schob sich auf dem Rücken langsam näher zum Bettpfosten, um den Kopf besser heben zu können; fand die juckende Stelle, die mit lauter kleinen weißen Pünktchen besetzt war, die er nicht zu beurteilen verstand; und wollte mit einem Bein die Stelle betasten, zog es aber gleich zurück, denn bei der Berührung umwehten ihn Kälteschauer.

Er glitt wieder in seine frühere Lage zurück. »Dies frühzeitige Aufstehen«, dachte er, »macht einen ganz blödsinnig. Der Mensch muss seinen Schlaf haben.«`,
  },
  {
    id: 'sample-ja-melos',
    title: '走れメロス (Run, Melos! - Osamu Dazai)',
    type: 'txt',
    language: 'ja',
    languageName: 'Japanese',
    flag: '🇯🇵',
    level: 'Upper Intermediate',
    description: 'A classic of Japanese literature with full romanization and vocabulary breakdown.',
    totalPages: 2,
    content: `第一章：激怒と誓い

メロスは激怒した。必ず、かの邪智暴虐の王を除かなければならぬと決意した。メロスには政治がわからぬ。メロスは、村の牧人である。笛を吹き、羊と遊んで暮して来た。けれども邪悪に対しては、人一倍に敏感であった。きょう未明メロスは村を出発し、野を越え山越え、十里はなれた此のシラクスの市にやって来た。

メロスには父も、母も無い。女房も無い。十六の、内気な妹と二人暮しであった。この妹は、村の或る律気な一牧人を、近々、花婿として迎えることになっていた。結婚式も間近かなのである。メロスは、それゆえ、花嫁の衣裳やら祝宴の御馳走やらを買いに、はるばる市にやって来たのだ。先ず、その品々を買い集め、それから都の大路をぶらぶら歩いた。

メロスには竹馬の友があった。セリヌンティウスである。今は此のシラクスの市で、石工をしている。その友を、これから訪ねてみるつもりなのだ。久しく逢わなかったのだから、訪ねて行くのが楽しみである。歩いているうちにメロスは、まちの様子を怪しく思った。ひっそりしている。もう既に日も落ちて、まちの暗いのは当りまえだが、けれども、なんだか、夜のせいばかりでは無く、市全体が、ひっそり寂しい。

===PAGE_BREAK===

第二章：友との約束

王城に入ったメロスは、たちまち捕えられ、ディオニス王の前に引き出された。
「お前は何をしにこの城に来たのか」と暴君は冷たく尋ねた。
「この市を暴虐の手から救うためだ」とメロスは胸を張って答えた。
暴君は低く笑った。「仕方の無いやつじゃ。お前のような者に何ができる。処刑してやる」

メロスは言った。「私は死を恐れない。だが、私には妹がいる。三日の日猶予をくれ。妹の結婚式を済ませて、私は必ずここに戻って来る」
王はせせら笑った。「嘘を言うな。逃げるに決まっている」
「逃げはせぬ！ 私には信じる友がいる。友のセリヌンティウスを人質としてここに置いていく。もし私が三日目の日暮れまでに戻らなければ、彼を殺すがよい！」

王の心に、残酷な好奇心が芽生えた。「よろしい。友を呼べ。ただし、三日目の日没までに帰って来なければ、お前の代わりにその友人を磔にするぞ」`,
  },
];

export function getSampleDocument(id: string): DocumentRecord | null {
  const sample = SAMPLE_DOCUMENTS.find((d) => d.id === id);
  if (!sample) return null;

  return {
    id: sample.id,
    title: sample.title,
    type: 'txt',
    size: sample.content.length,
    totalPages: sample.totalPages,
    lastReadPage: 1,
    lastReadAt: Date.now(),
    sourceLanguage: sample.language,
    targetLanguage: 'en',
    createdAt: Date.now(),
    fileData: sample.content,
    textContent: sample.content,
  };
}
