import Head from "next/head";
import styles from '../../styles/Task.module.css'
import { GetServerSideProps } from "next";
import {db} from '../../services/firebaseConnection'
import {
    doc,
    collection,
    query,
    where,
    getDoc,
    addDoc,
    getDocs,
    deleteDoc

} from 'firebase/firestore'
import { TextArea } from "@/components/textarea";
import {ChangeEvent, FormEvent, useState} from 'react'
import {useSession} from 'next-auth/react'
import {FaTrash} from 'react-icons/fa'
    interface TaskProps {
        item: {
            tarefa:string,
            created:string,
            public:boolean,
            user:string,
            taskId:string

        };
        allcomments:CommentProps[]
    }

    interface CommentProps {
        id:string;
        comment:string;
        user:string
        name:string
        taskId:string

    }
    export default function Task({item,allcomments}:TaskProps) {

        const {data: session} = useSession();
        const [input,setInput] = useState("")
        const [comments,setComments] = useState<CommentProps[]>(allcomments || [])

      async function handleComment(event:FormEvent) {
        event.preventDefault()
        if(input === "") return
        if(!session?.user?.email || !session?.user?.name) return

        try {
          const docRef = await  addDoc(collection(db,"comments"),{
            comment:input,
            created: new Date(),
            user:session?.user?.email,
            name:session?.user?.name,
            taskId:item?.taskId
          })
          const data = {
            id: docRef.id,
            comment:input,
            user: session?.user?.email,
            name: session?.user?.email,
            taskId: item?.taskId
          }

          setComments((oldItem) =>[...oldItem,data])
          setInput("")
          

        } catch(err) {
            console.log(err)
        }
      }
   async function handleDeleteComment(id:string) {
        try {
           const docRef = doc(db, "comments",id)
           await deleteDoc(docRef)
           const  deletComment = comments.filter((item) =>item.id !== id)

           setComments(deletComment)
           
        } catch(err) {
            console.log(err)
        }
   }

    return (
        <div className={styles.container}>
            <Head>
             <title>Detalhes da tarefa</title>
            </Head>
            <main className={styles.main}>
                 <h1>Tarefa</h1>
                 <article className={styles.task}>
                    <p>
                    {item.tarefa}
                    </p>
                 </article>
            </main>
            <section className={styles.commentsContainer}>
                 <h2>Deixar Comentario</h2>
                 <form onSubmit={handleComment}>
                    <TextArea
                    value={input}
                    onChange={(e:ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value) }
                     placeholder="Digite seu Comentario..."
                    />
                    <button className={styles.button}
                     disabled={!session?.user}

                    >Enviar comentario</button>

                 </form>
            </section>

            <section className={styles.commentsContainer}>
               <h2>Todos Comentarios</h2>
                {comments.length === 0 && (
                    <span>Nenhum comentario foi encontrado...</span>
                )}

                {comments.map((item)=>(
                    <article key={item.id} className={styles.comment}>
                        <div className={styles.headComment}> 
                        <label className={styles.commentsLabel}>{item.name}</label>
                             {item.user === session?.user?.email && (
                                <button className={styles.buttonTrash} onClick={()=>handleDeleteComment(item.id)}>
                                <FaTrash size={18} color="EA3140"/>
                            </button>
                             )}
                           <p>{item.comment}</p>
                        
                       <p>{item.comment}</p>
                       </div>
                    </article>
                ))}
            </section>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({params}) => {
    const id = params?.id as string
    const docRef = doc(db,"tarefas",id)
    const q = query(collection(db,"comments"), where("taskId","==",id))
    const snapshotComments = await getDocs(q)
     let allcomments: CommentProps[] = [] 
     snapshotComments.forEach((doc)=> {
        allcomments.push({
            id:doc.id,
            comment:doc.data().comment,
            user:doc.data().user,
            name:doc.data().name,
            taskId: doc.data().taskId
        })
     })
       console.log("olhadinha",allcomments)

    const snapshot = await getDoc(docRef)

    if(snapshot.data() === undefined) {
        return {
            redirect: {
                destination:'/',
                permanent: false
            }
        }
    }
    if(!snapshot.data()?.public) {
        return {
            redirect: {
                destination:'/',
                permanent: false
            }
        }
    }

    const miliseconds =  snapshot.data()?.created?.seconds * 1000

    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user:snapshot.data()?.user,
        taskId: id,
    }
    
    return {
        props: {
            item: task,
            allcomments: allcomments,


        }
    }
}