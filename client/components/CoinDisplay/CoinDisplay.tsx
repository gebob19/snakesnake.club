import { h, Component } from 'preact'
import './CoinDisplay.scss';

interface PropTypes {
  value: number;
}

interface StateTypes {
  // current displayed value
  valueDisplay: number;
  // time animation started
  timeStart: number;
  // value that animation started at
  valueStart: number;
  // value that animation targets
  valueTarget: number;
}

export default class CoinDisplay extends Component<PropTypes, StateTypes> {
  private animation?: number;

  constructor(props: PropTypes) {
    super(props);
    this.state = {
      valueDisplay: props.value,
      timeStart: 0,
      valueStart: props.value,
      valueTarget: props.value,
    };
  }

  componentWillReceiveProps(nextProps: PropTypes) {
    if (nextProps.value != this.props.value) {
      this.setValueTarget(nextProps.value);
    }
  }

  setValueTarget(valueTarget: number) {
    const {
      valueDisplay,
    } = this.state;
    this.setState({
      timeStart: Date.now(),
      valueStart: valueDisplay,
      valueTarget,
    });
    if (typeof this.animation == 'number') {
      cancelAnimationFrame(this.animation);
    }
    this.animation = requestAnimationFrame(this.animateValueDisplay.bind(this));
  }

  animateValueDisplay() {
    const {
      timeStart,
      valueStart,
      valueTarget,
    } = this.state;
    const progress = Math.min((Date.now() - timeStart) / 1000, 1);
    this.setState({
      valueDisplay: valueStart + Math.round((valueTarget - valueStart) * progress),
    })
    if (progress < 1) {
      this.animation = requestAnimationFrame(this.animateValueDisplay.bind(this));
    } else {
      this.animation = undefined;
    }
  }

  render() {
    const {
      valueDisplay,
    } = this.state;
    return (
      <div className="CoinDisplay" aria-label={valueDisplay + " coins"}>
        <img className="CoinDisplay-coin"
          src="/static/assets/coin.svg"
          alt=""
        />
        {numberWithCommas(valueDisplay)}
      </div>
    )
  }
}

function numberWithCommas (x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
