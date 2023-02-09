import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

//region Import styling
import Sizes from '../../constants/Size';
import LayoutStyles from '../../styles/Layout';
import TextStyles from '../../styles/TextStyles';
//endregion

import { useNavigation } from '@react-navigation/native';
import { Images } from '../../../assets';
import CustomButton from '../../components/CustomButton';
import { MenuItems } from '../../data/MenuItems';
import { SignOut } from '../../utils/authentication';
import { scaleSizeUI } from '../../utils/scaleSizeUI';
import { useDispatch, useSelector } from 'react-redux';
import Popup from '../../components/Popup';
import LogoutConfirm from '../Logout/LogoutConfirm';
import { useState } from 'react';
import { useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { addCurrentUser } from '../../features/userSlice';

const Menu = ({ isMenuShown, handleShowMenu }) => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const navigation = useNavigation();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const dispatch = useDispatch();
  const [fullname, setFullname] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [email, setEmail] = useState('');
  const id = auth()?.currentUser?.uid;
  console.log(fullname, email);
  useEffect(() => {
    if (!auth()?.currentUser?.email) {
      setFullname('admin');
      setEmail('admin@gmail.com');
      setPhotoURL(
        'https://images.unsplash.com/photo-1585238342024-78d387f4a707?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8cGl6emF8ZW58MHwyfDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
      );
    } else {
      const subscriber = firestore()
        .collection('users')
        .doc(id)
        .onSnapshot((documentSnapshot) => {
          setFullname(documentSnapshot?.data()?.fullname || '');
          setEmail(documentSnapshot?.data()?.email || '');
          setPhotoURL(documentSnapshot?.data()?.photoURL || '');
        });
      return () => subscriber();
    }
    const getUser = async () => {
      const data = await firestore().collection('users').doc(id).get();
      console.log(data);
      setFullname(data.data().fullname);
      setPhotoURL(data.data().photoURL);
      setEmail(data.data().email);
    };
    getUser();
  }, [dispatch, id]);

  const renderItem = (item) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={() => navigation.navigate(item.toScreen)}
      >
        <Image source={item.icon} />
        <Text style={[TextStyles.textMain, styles.menuItemText]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };
  const handleSignOut = () => {
    setIsPopupVisible(true);
  };
  const onLogout = () => {
    SignOut();
    navigation.navigate('Welcome');
    setIsPopupVisible(false);
    handleShowMenu();
  };
  return (
    <View style={[styles.menu, { zIndex: isMenuShown ? 1 : -1 }]}>
      <Popup isVisible={isPopupVisible} hidePopup={() => setIsPopupVisible(false)}>
        <LogoutConfirm onCancel={() => setIsPopupVisible(false)} onLogout={onLogout} />
      </Popup>
      <View style={LayoutStyles.layoutShadowRed}>
        <Image source={{ uri: photoURL || currentUser.photoURL }} style={styles.avatar} />
      </View>
      <Text style={TextStyles.h2} numberOfLines={2}>
        {fullname}
      </Text>
      <Text style={TextStyles.textMain}>{email}</Text>

      <View style={styles.menuItemGroup}>{MenuItems.map((item) => renderItem(item))}</View>

      <View style={styles.buttonContainer}>
        <CustomButton text='Log Out' iconSource={Images.ICON.LOGOUT} onPress={handleSignOut} />
      </View>
    </View>
  );
};

export default Menu;

const styles = StyleSheet.create({
  menu: {
    width: '65%',
    position: 'absolute',
    height: Dimensions.get('screen').height,
    paddingVertical: Sizes.sizeLargeH,
    paddingHorizontal: Sizes.sizeBig,
  },
  avatar: {
    width: scaleSizeUI(90),
    height: scaleSizeUI(90),
    borderRadius: 100,
    marginBottom: Sizes.sizeBigH,
  },
  menuItemGroup: {
    marginTop: Sizes.sizeMassiveH,
  },
  menuItem: {
    flexDirection: 'row',
    marginBottom: Sizes.sizeLargeH,
  },
  menuItemText: {
    marginLeft: Sizes.sizeSmall,
  },
  buttonContainer: {
    width: scaleSizeUI(117),
    height: 60,
    position: 'absolute',
    bottom: scaleSizeUI(120 + Sizes.sizeLargeH),
    left: Sizes.sizeBig,
  },
});
