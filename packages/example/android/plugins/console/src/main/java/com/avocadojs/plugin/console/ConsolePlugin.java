package com.avocadojs.plugin.console;

import com.avocadojs.Avocado;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginResult;


public class ConsolePlugin extends Plugin {

    public ConsolePlugin(Avocado avocado) {
        super(avocado, "com.avocadojs.plugin.device");
    }

    public void log(PluginCall call) {
        PluginResult r = new PluginResult();

        r.put("version", android.os.Build.VERSION.RELEASE);

        call.successCallback(r);
    }

}
