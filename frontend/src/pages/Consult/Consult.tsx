import { useState, useEffect } from 'react'
import { Button, Tooltip, Card, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@nextui-org/react";
import OtherConsult from '../../components/Consult/OtherConsult';
import SharedConsult from '../../components/Consult/SharedConsult';
import CreateNewConsult from '../../components/Consult/CreateNewConsult';
import Chat from '../../components/Consult/Chat/Chat';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import ChatIcon from './../../atoms/Icons/ChatIcon'
import XIcon from '../../atoms/Icons/XIcon';
import PencilIcon from '../../atoms/Icons/PencilIcon';

import { toggleOpen } from '../../store/chatSlice';
import { useSelector, useDispatch } from "react-redux";
import { RootState } from './../../store/store'
import { getConsultCategory } from '../../store/consultSlice';
import { getConsults, getCategory, getSharedConsult } from './../../api/consults'
import { consultType, categoryType } from '../../types/DataTypes';
import { villageBackgroundColor, villageTextColor } from '../../atoms/color';
import axios from 'axios';


// 고민상담소 첫 페이지

function Consult() {
  const dispatch = useDispatch()

  // 채팅창 관련 가져오기
  let chat = useSelector((state: RootState) => state.chat)

  // 회원 정보
  let member = useSelector((state: RootState) => state.member)
  let accessToken = useSelector((state:RootState) => state.accessToken.value)

  // 카테고리 받기
  let category = useSelector((state: RootState) => state.consultSlice.category)

  useEffect(() => {
    // 처음 들어오면 채팅창 닫혀있게
    if (chat.isOpen) {
      dispatch(toggleOpen())
    }

    // 처음 들어올 때 카테고리 목록 가져오기
    const fetchCategory = async () => {
      try {
        let tempCategory: categoryType[] = await getCategory(accessToken)
        dispatch(getConsultCategory(tempCategory))
      } catch (err) {
        console.log(err)
      }
    }
    if (category.length === 0) {
      fetchCategory()
    }
  }, [])


  const handleOpen = () => {
    if (chat.isOpen) {
      location.reload()
    }
    dispatch(toggleOpen())
  }

  return (
    <div>
      {/* 전체페이지 */}
      <div className="flex-col content-between w-full md:w-4/5 h-screen">
        {/* 뒤로가기 버튼 */}
        <Header />
        {
          category != null ? (
            <div className='pt-3'>
              {/* 다른 사람의 고민 */}
              <Others />
              {/* 공유된 고민들 */}
              <Shared />
            </div>
          ) : null
        }
      </div>
      {/* 채팅 창 여는 버튼 */}
      <Tooltip content={chat.isOpen ? '닫기' : '대화 확인하기'} placement={chat.isOpen ? 'right' : 'top'}>
        <Button
          isIconOnly
          size='lg'
          radius='full'
          variant={chat.isOpen ? 'solid' : 'flat'}
          onClick={() => handleOpen()}
          className={`${villageBackgroundColor[member.villageName]} ${villageTextColor[member.villageName]} fixed bottom-[3%] right-[4%] shadow-xl border-1 border-zinc-400 shadow z-20`}
        >
          {chat.isOpen ? <XIcon /> : <ChatIcon />}
        </Button>
      </Tooltip>
      <div style={{
          display: chat.isOpen ? 'block' : 'none'
        }} 
        className='w-full h-full absolute bg-gray-500 top-0 left-0 opacity-50 z-10'
      />
      {/* 채팅창 */}
      <Card
        style={{
          display: chat.isOpen ? 'block' : 'none',
        }}
        className='fixed top-[20%] right-[2.5%] w-[80%] h-[70%]
          sm:top-[20%] w-[95%] h-[65%] p-5 z-20'
      >
        <Chat />
      </Card>
    </div>
  )
}

export default Consult



// 모달 제어용 타입 지정
type useDisclosureType = {
  isOpen: boolean
  onOpen: () => void
  onOpenChange: (isOpen: boolean) => void
}


// 다른 사람들의 고민
function Others() {
  const navigate = useNavigate()
  let accessToken = useSelector((state: RootState) => state.accessToken.value)

  // 카테고리 받기
  let category = useSelector((state: RootState) => state.consultSlice.category)

  // 다른사람들의 고민List
  const [otherConsults, setOtherConsult] = useState<consultType[]>([])

  // 선택된 카테고리
  const [_selectedCategory, setSelectedCategory] = useState<categoryType | null>(null)
  const handleCategory = (e: any) => {
    setSelectedCategory(e.target.value)
    axios.get(`https://mindtrip.site/api/consults/v1/category/${e.target.value}`,{
      headers: {
        Authorization: accessToken
      }
    }).then((res) => {
      setOtherConsult(res.data.result.consultList)
    }) .catch((err) => console.log(err))
  }

  // 모달창 오픈 제어용
  const { isOpen, onOpen, onOpenChange }: useDisclosureType = useDisclosure();

  useEffect(() => {
    // 전체 고민 가져오기
    const fetchConsult = async () => {
      try {
        let tempOtherConsult: consultType[] = await getConsults(accessToken)
        setOtherConsult(tempOtherConsult)
      } catch (err) {
        console.log(err)
      }
    }
    fetchConsult()
  }, [])


  return (
    <div className="px-3 min-h-[40%]">
      <div className='flex'>
        <p
          className="text-2xl hover:cursor-pointer mb-3" 
          onClick={() => navigate('/consult/other')}
        >
          🙋‍♀️다른 사람들의 고민 보기
        </p>
        {/* 내 고민 작성하기 */}
        <Tooltip content='내 고민 작성하기'>
          <Button isIconOnly variant='light' onPress={onOpen} className='pb-2 ml-2'><PencilIcon /></Button>
        </Tooltip>
      </div>
      <div className="flex justify-between mt-2">
        {/* 카테고리들 */}
        <Select
          label='카테고리 선택'
          size='sm'
          onChange={handleCategory}
          className='w-[150px]'
          style={{fontFamily:"JamsilThin"}}
        >
          {category.map((oneCategory: categoryType) => {
            return (
              <SelectItem key={oneCategory.categoryId} style={{fontFamily:"JamsilThin"}}>
                {oneCategory.categoryName}
              </SelectItem>
            )})
          }
        </Select>
        <p
          className='underline underline-offset-4 hover:cursor-pointer pt-3'
          onClick={() => navigate('/consult/other')}
          style={{fontFamily:"JamsilThin"}}
        >더보기</p>
      </div>
      <div className='mt-2 flex overflow-x-auto'>
        {
          otherConsults?.map((consult, idx) => (
            <div className="w-44 h-[20vh] m-2 min-w-44" key={idx}>
              {consult.isClosed === false && <OtherConsult consult={consult} />}
            </div>
          ))
        }
        {
          otherConsults?.length === 0 ? (
            <div className='h-[20vh] text-gray-400'>
              아직 업로드된 고민이 없습니다!
            </div>
          ) : null
        }
      </div>
      <Modal size="sm" placement='center' isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>내 고민 공유하기</ModalHeader>
              <ModalBody>
                <CreateNewConsult onClose={onClose} category={category} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}


// 공유된 고민
function Shared() {
  const navigate = useNavigate()

  // 카테고리 받기
  let category = useSelector((state: RootState) => state.consultSlice.category)
  let accessToken = useSelector((state: RootState) => state.accessToken.value)

  const [shared, setShared] = useState<consultType[]>([])

  // 선택된 카테고리
  const [_selectedCategory, setSelectedCategory] = useState<categoryType | null>(null)
  const handleCategory = (e: any) => {
    setSelectedCategory(e.target.value)
    axios.get(`https://mindtrip.site/api/consults/v1/shared/${e.target.value}`,{
      headers: {
        Authorization: accessToken
      }
    }).then((res) => {
      setShared(res.data.result.consultList)
    }) .catch((err) => console.log(err))
  }

  

  useEffect(() => {
    // 전체 고민 가져오기
    const fetchConsult = async () => {
      try {
        let tempSharedConsult: consultType[] = await getSharedConsult(accessToken)
        setShared(tempSharedConsult)
      } catch (err) {
        console.log(err)
      }
    }
    fetchConsult()
  }, [])



  return (
    <div className="px-3 min-h-[40%] mt-10">
      <p className="text-2xl hover:cursor-pointer" onClick={() => navigate('/consult/shared')}>🔍공유된 고민 상담들 둘러보기</p>
      <div className="flex justify-between sm:items-center">
        <div className="md:flex md:items-center w-5/6 mt-2">
          {/* 카테고리들 */}
          <Select
            label='카테고리 선택'
            size='sm'
            onChange={handleCategory}
            className='md:mr-5 max-w-[150px]'
            style={{fontFamily:"JamsilThin"}}
          >
            {
              category.map((oneCategory: categoryType) => {
                return (
                  <SelectItem key={oneCategory.categoryId} style={{fontFamily:"JamsilThin"}}>
                    {oneCategory.categoryName}
                  </SelectItem>
                )
              })
            }
          </Select>
        </div>
        <p
          className='underline pt-3 underline-offset-4 hover:cursor-pointer block'
          onClick={() => navigate('/consult/shared')}
          style={{fontFamily:"JamsilThin"}}
        >더보기</p>
      </div>
      <div className='mt-2 flex overflow-x-auto'>
        {
          shared.map((consult, idx) => {
            return(
                <div className="w-44 m-2 min-w-44" key={idx}>
                  <SharedConsult consult={consult}/>
                </div>
            )
          })
        }
        {
          shared?.length === 0 ? (<div>아직 공유된 고민이 없습니다</div>) : null
        }
      </div>
    </div>
  )
}
