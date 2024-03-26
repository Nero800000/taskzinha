import { GetServerSideProps } from 'next'
import styles from '../../styles/Dashboard.module.css'
import Head from 'next/head'
import {getSession} from  'next-auth/react'
import {TextArea} from '../../components/textarea'
import  {FiShare2} from 'react-icons/fi'
import {FaTrash} from 'react-icons/fa'
import {ChangeEvent, FormEvent, useState, useEffect} from 'react'
import {db} from '../../services/firebaseConnection'
import {addDoc,collection, query,
 orderBy,where, onSnapshot, doc,deleteDoc} from 'firebase/firestore'
 import Link from 'next/link'

interface HomeProps {
   user: {
      email: string
   }
}
interface TaskProps {
   id:string,
   created:Date,
   public:boolean,
   tarefa:string,
   user:string
}
export default function dashboard({user}:HomeProps) {

   const [input,setInput] = useState("")
   const [publicTask,setPublicTask] = useState(false)
   const [tasks, setTasks] = useState<TaskProps[]>([])
  
   
   useEffect(()=> {
      async function loadTarefas() {
          const tarefasRef =  collection(db, "tarefas")
          const q = query(
            tarefasRef,
            orderBy("created", "desc"),
            where("user", "==", user?.email)
          )
          onSnapshot(q, (snapshot) => {
             let lista = [] as TaskProps[];
             snapshot.forEach((doc) => {
                 lista.push({
                  id:doc.id,
                  tarefa:doc.data().tarefa,
                  created: doc.data().created,
                  user: doc.data().user,
                  public: doc.data().public
                 })
             })

             setTasks(lista)
          })
      }
      loadTarefas()
   }, [user?.email])

   function handleChangePublic(event:ChangeEvent<HTMLInputElement>) {
       
       setPublicTask(event.target.checked)
   }

  async function HandleRegisterTaks(event:FormEvent){
          event.preventDefault()
          if(input === "") {
            return
          }

      try {
            await addDoc(collection(db,"tarefas"), {
               tarefa:input,
               created:new Date(),
               user: user?.email ,
               public: publicTask

            })

            setInput("")
            setPublicTask(false)
         
      } catch (error) {
         console.log(error)
      }
   } 

  async  function handleShare(id:string) {
         await navigator.clipboard.writeText(
            `http://localhost:3000/task/${id}`
         )
         alert("Url copiada com sucesso")
   }

   async function handleDeleteTask(id:string) {
          const docRef = doc(db,"tarefas",id)
          await deleteDoc(docRef)
   }

     return (
        <div className={styles.container}>
           <Head>
            <title>Meu painel de tarefas</title>   
           </Head>

           <main className={styles.main}>
                <section className={styles.content}>
                 <div className={styles.contentForm}>
                     <h1 className={styles.title}>Qual sua tarefa??</h1>
                     <form onSubmit={HandleRegisterTaks}>
                       <TextArea
                        placeholder='digite qual a sua tarefa'
                        value={input}
                        onChange={(e:ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                        

                       />
                       <div className={styles.checkboxArea}>
                         <input type="checkbox"
                           checked={publicTask}
                           onChange={ handleChangePublic}
                         />  
                         <label>Deixar tarefas publica??</label>
                       </div>
                       <button className={styles.button} type='submit'>
                          Registrar
                       </button>
                     </form>
                 </div>
                </section>

                <section className={styles.taskContainer}>
                   <h1>Minhas Tarefas</h1>
                   {tasks.map((item)=> (
                       <article key={item.id} className={styles.task}>
                        {item.public && (
                            <div className={styles.tagConatainer}>
                            <label className={styles.tag}>Publico</label>
                            <button className={styles.shareButton} onClick={() => handleShare(item.id)}>
                            <FiShare2
                             size={22}
                             color="#3183ff"
   
                            />
                            </button>
                         </div>
                        )}
                       <div className={styles.taskContant}>
                           {item.public ? (
                              <Link href={`/task/${item.id}`}>
                               <p style={{color:"black"}}>{item.tarefa}</p>
                              </Link>
                           ): (
                              <p style={{color:"black"}}>{item.tarefa}</p>
                           )}
                           <button className={styles.trashButton} onClick={() =>handleDeleteTask(item.id)}>
                               <FaTrash
                                size={24}
                                color='#ea3140'
                               />
                           </button>
                       </div>
                    </article>
 
                   ))}

                </section>
           </main>
        </div>
     )
}

export const getServerSideProps:GetServerSideProps = async ({req}) => {
     const session =  await getSession({req})
     if(!session?.user) {
         return {
            redirect: {
               destination: '/',
               permanent: false
            }
         }
     }
   return {
      props: {
         user: {
            email:session?.user?.email
         }
      }
   }
}