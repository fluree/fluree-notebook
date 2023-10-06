import useGlobal from '../hooks/useGlobal';

const Drawer = () => {
  const {
    state: { open },
    dispatch,
  } = useGlobal();

  const toggle = () => {
    dispatch({ type: 'open', value: false });
  };

  return <div> here goes </div>;
};

export default Drawer;
