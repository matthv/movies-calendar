import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/fr';

dayjs.extend(customParseFormat);
dayjs.locale('fr');

export default dayjs;
