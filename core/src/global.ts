import { Avocado as _Avocado } from './definitions';

var Avocado:_Avocado = {
  Plugins: null
};

const Plugins = Avocado.Plugins;

declare var window: any;
Avocado = window.Avocado = window.Avocado || Avocado;

export { Avocado, Plugins };
