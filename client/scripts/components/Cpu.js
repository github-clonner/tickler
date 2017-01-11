import os from 'os';
import React from 'react';


function prettyBytes(num) {
  const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  if (!Number.isFinite(num)) {
    throw new TypeError(`Expected a finite number, got ${typeof num}: ${num}`);
  }

  const neg = num < 0;

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B';
  }

  const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), UNITS.length - 1);
  const numStr = Number((num / Math.pow(1000, exponent)).toPrecision(3));
  const unit = UNITS[exponent];

  return (neg ? '-' : '') + numStr + ' ' + unit;
}

//Create function to get CPU information
export default class Cpu extends React.Component {

  constructor(props) {
    super(props)
  }

  cpuAverage() {
    //Initialise sum of idle and time of cores and fetch CPU info
    var totalIdle = 0, totalTick = 0;
    var cpus = os.cpus();

    window.os = os;
    console.log(os);

    //Loop through CPU cores
    for(var i = 0, len = cpus.length; i < len; i++) {

      //Select CPU core
      var cpu = cpus[i];

      //Total up the time in the cores tick
      for(type in cpu.times) {
        totalTick += cpu.times[type];
     }

      //Total up the idle time of the core
      totalIdle += cpu.times.idle;
    }

    //Return the average Idle and Tick times
    return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
  }

  getCpuStats() {
    //Grab second Measure
    var endMeasure = this.cpuAverage();

    console.log('endMeasure: ', endMeasure)
    return 123;

    //Calculate the difference in idle and total time between the measures
    var idleDifference = endMeasure.idle - startMeasure.idle;
    var totalDifference = endMeasure.total - startMeasure.total;

    //Calculate the average percentage CPU usage
    var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

    //Output result to console
    this.setState({
      percentageCPU: percentageCPU
    });
    return percentageCPU;
  }

  render () {
    let x = this.getCpuStats();
    return (
      <h1><span>% CPU Usage</span></h1>
    )
  }
}
