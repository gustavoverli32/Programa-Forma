"use client";

import type { BootstrapPayload } from "@/services/read-client";

type Props = {
  activePage: string;
  onPageChange: (page: string) => void;
  session: BootstrapPayload["session"];
  onLoginClick: () => void;
};

export function Sidebar({ activePage, onPageChange, session, onLoginClick }: Props) {
  const isTutora = session?.role === "tutora";
  const isGGA = session?.manager?.tipo_gestor === "gga" || session?.manager?.tipo_gestor === "lider_regional";

  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <img
          src="data:image/webp;base64,UklGRv4cAABXRUJQVlA4IPIcAAAQeACdASosASwBPpFGnkslo6MhpdK5mLASCWJu4R6wkUF+zNeM/K78gPltrz92/uXI3Vn5f3QH/h/vnqM/Xn3Ofon/g/n/9AX6xfr91u/3O/ID4Gf1P/J/td7zf+s/bD3Xf3//dewJ/jPPL9jT0Ef3T9Oj94/hj/tP/P/c/20P//7AH//9vjo9+znnG8QP43G5efXoL7QtRrwfxu74/jhqBeJ/E73EtofQL9iftn7C+v58j5m/yv+B9gDg2PQfYG/lv+s9YX/S8p31v6nPUn9IZsYieuMFHr1jDDhYwU2Yo6FmPH0wSOxSo8Sh2kV5diTqUgYUYUhDNva5zS9YhHPaAAUnz/r8lqcp1Lp0/bCaMfF45iIdEjP7j+3yMmzpskjQHbysJYn7y23+7Y0ObsNHYwywOqxueGrEuExX4ojfVYTybe89pF3f3sTLJ1KNavJx9vWcFeejGDvc3nqd79aelmNkMYqj3xKodw9LY7DMzR00/tH1esMap/7OSriXms+XjJhWGqkO//+0ZN7FP9Idb1cuvt4teybNIH/chghHs5IfPzzKiAFCP9a5P1S45x+f/4BXkPwx1wJxV/488J2YtHfqqFmAw4MNtPKlY7/btmgiZhtItxXHOw4nxBv5nYwFVbFlkX4GaJHQNktHSNNIlddKzv2I80CzTwQFAl0lncymYzfaf61yF88MnzyqYi071bqqvQ2TAGQ3/CXDwEOn878+aw5KQN9MinrmxuH2683HgQKu3UU5YfV/AtLZJ4dmvO7qculIGNue+E/VKyrRFGFofRUo/dfdggv+Mm7L/36mldI71MlFBbj6E+mmwRTmIKD3Jop9qdHNrOveEE3NnTHQRbnWZ4Jksy3UE66HoziSTcLd0FtBL7b86n/NF29MJkPF3rbytC/rCWW/uudQdorIHnZYFNthZ+PvyGpAODyLWzzrnP/9MFy6CU9lB1MWGT1zkt9bOsjloishuYo4UYTHJii4n3ZAbaDtUVfeTwOZ7oD6Z8tl85eWiqGg7L7CjH5xuDMQ0MaCMKTTqQCXFJFSISod56+lFng2/gJHHzkfJz08/QqHonwY0fNUQIpjlX8QUxfYVkFF9zVcRXjmifKu+lXuYd+j3DjNqdVoYqOxKEFYt3BHSoIjq0BbG89mwg3tB/Zg5PPyBtmaoYb3S1RZgheXbgeGf6n3Qv+IwaCir5AC3CRKH1zQRfG6YB+cnqdjPb6f9dU4cOSe1iHl0KdG34gmFbMHb/YgAx2Ovd8ayv+oSto8533Yg3hI1akhN4mYIvcbDEAA/Or/2JLoE7c/qYf+5dPGJ4xPj4qebzZ7jaEZk2E7/rj86DmfjbFRYdMLSYrDqNJAVYvHjp/9QJRqVBZiNQUQZlj6Jp6N8I+N3LVoKzncruoi8nZ1bJl0DvZtHe3CjCVObUFNFAEcdrGv4DxPuu64q4AU9uCHFMi981yXkAFYd71xdspT2Kiwyzjq41oIRiEudnUZ70V6n+rgIccv6yEXyNdcVTHIfQ/mOlov4iqRJaDcM4edalc2PG3J0Rr1XHu/j4l8ojD1dHsXP7EGsZWC3ZlGC5r0A+Rh8yKO2aCIqsp0G7zvYSxPttBffMnwW4CvwI9AOl1a27fFrQeAQMLxQOLkc/G10WQ0UgyTK1P2TFuZGr8z3aqMgvb2mdfS3UoIfTGbu4CUKhZhMT3xpyBVLoqIpOwfqtwfW/tpqE5WTgXTCV5gJbGO5uwo08FHVUdouWtJMiItbzzZcj3y/tCQGUMXnLC1TE4BgDR1b+g/zMreX4ZJDn3M+f+yfB7MDKW3qXeLaPdULyc0zCKsHVHmXgq1cU4sgcbKqjbCAYecNhTVUByJJaCLk1RutiZ0rfrWu4WA22enZJ4Ljos+F4KX2/fCeUqKT+rI/WszrLS7nKP2iEilAmmO/Xkr0YRsipUntEBTFloF0NIWwJb6uq9Oll3+Qwgau+p827i/ce0JzrQpD8AB+yRCdUDUGhfHPmPeWd+zcS4h5Q+omtQR9+hAS2OIVHgMuNztkLMqkgJUzCJyo6csdxviI6Xrk6OUkPTzK6boX3TpkJq0vjVzO1IJzKMfcYAXN77vUH6W+5Fo8i0Ja7/m3hlcbSNhI2GMiSAJ1riTEKBNhKUW9VO+0ARe7EapxXCRTWE2AIV3Jq8jqOY8SADNSTd7ghWwfFY8Ssa37kD+yxD8OC7pXBI/CHAmm8bFeDuzUtGl6r+OFGY/aQpg66f6lB5pH708phYyK1IMb4OY8HYsx2K54joURdNBPIDiP/COoOvAsHEfQX2zMM43gWpxDe1kZv/2H1+Y58ZK+bTTiaBt5FnSXWbYTwsOJz0gY2Y5AMg25SOzdiYmgXKoOn71oF/ijvAj8+i/UN4sm6SNMg2aHFZByIYVUpJHOqSSfubUiareFx5CEzp+hTGWkDx4FP4+K7lsFDuaO7mWy21vFJcOSdYSUEPHi/ZS+WIzKasjF9b/rpjKXnQjb6tbstIn+7cm8rkS8d+AXEX/84R8kQfTOocF3FM8G6pfxT55GWxkwmnkPJdacEU6FVBNW7WBedo2XP0qIYQnssv+Plwd6EkYnVynYbmTl7g6zSQByaASBlX27G3I3KlxM3dSG5Qy4vxGZpWsdA1Y3ehZOHUDA41vIVh+f8AESxnCt3ORrX54vBGyL6poa1zXsn5PXdHfbmwQOgoUC5ZnFVJvjoUGA7olyz2/4SU6tCxgIbXUNj6HvfLaC4eQ5fS0yQh+bXmI7NkmpbvUjee03cZVsTVVOu7r19VQmXMSC58M+tvg/ZfG989YcgnhUJkqBS40JrCWT3RraIIj0cuvi3m73SgV0X8Y7hGdvQgNKLGfh0l7YLZ2gv/SCXIbD8ibtlsko/65JDApLjUaUlROroDMJ5yv7+BWuZqgYTdikpeAtDwZz7O+RyjrnNWofNHQ3EotyCsGTI4ProRqKrH+r0IWquK1XO4aPHRZd53/143nJTMa33KrycLeoGkeY352ND9XLT5rMZdiGPT2iiWi+S8AVkYuQRVfgD5Y0njgJX4oUXxvLYU0WBL6sW1SoxQl1ieAfE2vLAHeI8yZEF1YzJGJy90nLYnc++nThh/2YUKq8Pf7s6W43hu7BHTvgLSIm3MC18K0qwMypavCGwiUUMJDDP40K14tfmC47xX1+8oErd6ckCN9X/NCEu6kGXSm9zm+Ewwwyh0SRfveh5rv395411UVCKCztcABueFbHUQDwpcfgyAucsdBK5cen62bdYiPX4UkrF8RDPuOyN7IOH07FcvDt8wF4DkiZOOasfpyzniyCBnl6ydEpjfxlkE+3JSKNuA123CWq+YHd7gvcVmcRquOhnIKkbQReXQdLHRN9o+Xw8DOtlyVxv+Xsjp0ZA+oRwdPEBvGUJBcX9MXnlssCgqJBzUKm+duy/5k5raSXnNulZlXwW1IhX2CrURQLRB3zJVwmvfsJYdnbfXjo4ZI1sGKsVUnQ3uh2blx9OdGgj1T66TcU/IMlEadeO8AAS57X1O4GFDmflUJe9smDFcNImk85GT/p97T+fAGX6XNkls+OcZ478LVLgCDQoomL+LxOxa+o5Gig3kQlI3OfsSr4o0z/MuNZ3EtQuXJVPozHkH2U8l5hhUl2+yBxnSYjHPly8AL6Gq95nI48nGPRUAtZiJw8+Q3Qu542l7jeqJlX/5ZxoFLuhTTzO03Gqbwp+8TZNEo2h2q87fpc3pWhR45H3M5L15pQq7nabryruAzcq7xmLqacbxFiR3t9gdJkGXx/PBKYZrwN+9IbK8D8wPD2iM9cDkJaDnaqg4xEclSxeHTuJSr2jpng131SMyQ1u5uw9jnO2kIdtx3TRDAr66UntABc2xtWU4Q5cgDX+WnHGsZ3dGdDDgqB35J57jNeUCm/L0lwkXOvFHzG2oO/BqSWRSl+OHUsSNfYRYUEfpjZbwvcK0lF2VAOzk1LiOdoYtqcw5G4l1EFw2Zfh8tZcPeRDa8NMLsma6B1ruItGaJeNS9Vg1hg/CXHeLWniQlEWwCsqIa44UlvkwOtmGcdJo3Olv2Ni0p0KkN/9Wfkl3Oe3AsvFH3tIGpEQ+2A7+hY37QlsUU0FCeK9RoefPbngK/XRwtOxXsjpJd0kXiinz0/y7zLfDMah/Io/siRVw1dU6LPRi1BH12arzt8aT0ImxKSulK8bw79YlwonJux60bNE/M8LTFsAS3Oo7jCFfVFqyZ4YJh0DJK2NZkTkDWuIWAAaivwDGuMvocYXXbrd5ZFFDHdzBct6YcFcDUvsiYRGZG5vRuSQOyUGQqGFx6fRh9zPII3mCk3RZfa5lZ2Jjs7lcNjrgUZc3lQzSg2OWhRMjewzDgh195f6UoTb8lhB8rufmrW+BK9WZcnQZRlnI6imUBIyKuGJ3se4c7Li9Q7jKZf5Jxbyj5AGz2tT2jXFnW648Nom/r3/tAP5wfl11IL6vrEm0Bj4TwePq1//HqN64Yp7f+He3/JlkRJ1/jZNAoXiD2XWEMm7w3PpBuplr87TE6AsJBDJ97er+X1Fj47t6USVz2yOCZGaRCEIAb+ljQsz5Nt+g52/nbr79WiDrM/zrRkjEoWEV1+Rf8/znVrHNy4mpB+G8bF5if7e86qJSYq77RI+tHj6DaNwP2kflJjViO+Kcb+xwGCeXWiuE44mgqnDlEHpEZktKEsDVLudB7ywR9lVJfb5hLpDr+yZAPSWlRhECWo4oJ9M77DfUnWSNLzgr6s/AtJNjWrWTJZoPKyqsBZTx9vj9kmBTXt1OWP5OymRUh5ShwtTX//z1rlg9KjlydwAS1hNwZZ8WH2E4Q3AGsg8EfqtxVs94STQEM2tU5848MC3DRtnUSzKKFcpwNgce9KYpx2+tdw7c6UctVWbbKjuRtYUbvSP9hrCu3aTf1jsRpbrC4rBX/RQl+Zq4WQzbflj0bcZvJYIVGG2xCsJ8Iiq5rKZomuGq4eY46xNLLSqFb8kbrBImhIHDnFnzwGD1fC2rHesMrc0KWR7U+eBMXPEqLlNsrG/ftLX4xKyTm8ddu67IrsevFJuN36qYrXs+ZXDo006IJZbjGluOy+sCayiE3H9Nm9GL8ezocPDjWHO1ynbwsa7MOjNMJFLY1+dhJ2Vx1wCJFje6Rqof2CJyAyOxxwC26JKQbcTAhVKUcDc6+M5q+Tdht+ILzA/8sCb5rDa3eT7k3CXRYXe0OCLTioIxW4DGkFRilThpcC8FPZ0kXAqRKiGeRa/1saWx6OE7QhOqVHgO3db6ymUlXleZ0wLkT3UvzdiT2J5EGuV9T/m/+knmitIzTeUK+cIeNTNiz8KAGy0gqUnng3Yg19kRxC+hwN97YCqFCb46RJtvusHPolAElX7T+a9JMy5SPh16gcBXtb/UN5NmxOpcHLyeI9zgpV8diBZwbYP9o8M5LHXsR9KDVcjsxiM0Hv03Rw14t5+IS3aHF01/wFrXm42pZpTOHnJsweWbNvdLiBzn2H0JxCPG4jxuKybhCvWiJIlOOTTWhG7QVedRwdbSgeT4aG6Ud6bQm66R1Q3E20Ze5prf4rm3n1LruTsTKZ+9cBS61OA94MRi+qikaDo48TVkeAZOkGsTO5zQ1B4JrbQkz/PIypX8BeT7DqgfWfWf+eMwrJ+3n15M7/5N+qbLzyJ8tEZAV9KzDIGUwOTVTRQdIfP5lj2XuYiMmiUj7WMsMIcMBEXYWJ/tmxblqlF6LCZ34vEc822ii3Fpq9cignPiZKTpAN+5NZxtcJC+PIVDg2I0ZQ/CvqCdkkYZ0tjZhaXpBRnHyr8kn1aAdBRynXT8scF0PATM4UJPw3QmUnE+JdpXl9P1jXetMrEcBM8o5JlVgikHmHVeXBflTBVc+oDOYmYxE0RCmw+YfrYlX3vUX9cMhMbUUJi5EcISTvLgh9W0uuYqoxBL7bGrKqCfaQyLVhMxYjO37csOIn39/7bfz2jiLngyR7Gdn3s+OJH435NW/Z0avWPFI5KDUKSkeJIRkiYmkVHWh6PR5mBy0/p3QB7espq5B6EJ/DmQ+6wp1FXrFdUOu+CN44C/VqFSx+7FW2PxPgZZKfiAsdl1BLet6RfScMIYJwxBap/Evtpnyf2R3hq2VOH5fPA+3QCe/CiY6RahO1qkYDleqeWYwgJsRcD7djJOYB8vahRGN7ZVcdOJ2bZHZKYSR2F94qnEGQTchGs5fSmxAE1mErzDCaPL4ybpZ95EYANOrOzxwYXtR3tVR8pOLMx1iP5UdjH/BTj/q5/yd4eZM9+c0D4W9D4i4qgIHW91tiqbv7nwCSmjvZuA9SqOy9XXV00vSMohMjH/6kQloEPtbMnugFEnJDy82hhwDwTxy8Vgcsnp2QGlXXxGPy3n6k3XzOpSYnYs7Q/ZMeSonfFhFJZaz3YSNeUZEBZYTQ62jzosEDyp9be54aKDxwvqwU/gyroDnKYNFovsKTutg/GlAmbTzDNDTuAXHbZHP3l7gSJmtnbVqQPrS6ZUr2uGe+FbOA0PWiQX1OcwUAvbCywSc0tmWSkSL79MtUpKr0p4r7b3b25XIG8zLxl0PXSOF0J6leA13l7Zc1GAueQ1Rz84LlR+/I8Kb0IcbG54qppeqMrrQHq8cgl80SKXNHD0MK9w3hj10/YoUT4aaIRDmY0TF25X6Ey11ZktWRuFmhMgppVZm7aaq+L20kkVWihTiV0cYNXyIesNq6WVYxzGpQrmcQSB62d68fDFfn813Iz3Qf3PRVUjBiHg59koaGm91Wga8oRCKXWdeqOwayMCIuDbbT/+kcpg++7H7gyq4dvt/wQ0J0dW6k68piNZmMYomaej01PKLYRuM6DcVtleI5b1bWTAbvtI0Obzx16CTi+edvNtkUbDl9Xci1JoHSYoQR61kqWty5HMa/PjkZ77mqEfN2+l6BWmZDAhD/AquwBZ4flBESkcysB35AUfumW3TooVbZ4o7Ap27pJE5sr8gNDSIcz+C+oySvYig0Jkbfwup1Lb6Y1fyLeBbXDvOJwty5J+0M7AiQP6IsIy3hU7COwOzAk9SjEnEQq+2vN+SWx2RT2jXmrlmjmkRQOO2pFnfH3DGXG5ThsDwBxpurAStX1aevOJhnlyAhByRmDplLd4N2hw4fj8/rZzzLIkIeT27zNB6VCPda2FYeR+uGVWZdFyxhrinMqKTo0/vN7CluFy9PSsn9MfXvI3epZlccfVMwk6QyVeE30kxiKEQi/bJDUgNSk5mjAoR4AZBAW1EgCFNtk8nhW9b7BWRUjaYyBXvA0lUGPMpnkQ6nI3ghAbwRUTaSU6Tui0ZVCTwn0kd5AdgnlnCgR3nyQLzYvUGwWTW54d2MCLgKK51gJ7I/jR9lumm/MPOdbeYBWFPtEQuVZ+5GtWn6WtSabAa0lYh6hz087hDQ2EsivtlPPM9Pjn9oIZ9eGVCrUU86tMaoJ/sI+MIkkhna7bgA8GfkdQpBUrIDeSp/8U7Ew70oDYnPE/p0Y2MjL02eFy5tgLBsLkPV3h92YyiWf75Rwqibp9zvxIJez1A5qsmwGkHi+OPMrH+ITEtn3H0MvyNyqLKl0J+lHwI2sExadgQ0KPHhGivTRyX7vr1/B3BoLDcu0m5/wdRYB/e6q7tG4PcgSIlvc+fWPAfa30AXEqq1lwwjncVQKsicgYqpTRufcl0jViDKGei8wxVFogDqYDPmRXQT4L+gQl/2hZREOPcMyXNcL7uSsMCSBlYgc0HvvgxVyNahDTsa2Vkbpu3NG+V73vvLgdY2g3Swlys53dqORJZn+kFHo7ZZB1s6AXCWMHyScpTSurY32GRYzyDmRV1btEp67EwnGlwJNetI07egVN8yILUt/NNtt0dKKztOoW3Xt4S4vGMzfhcKSqxS61HM9jf62GoNZ3m85uhDsY0K+QLnOLKYAlW3JUhCX00J+cwnDSvw7tamdrfbI2PUT4+ffkXR4gpsjxYpZu47zGZEOn/grc4nrq4gtieUH5b4e1n2Wzj+A+qERooxAh55exgJWl73WDoF/UPx1dK1OiC2PCMN5w5/7prVBhdGEz6AQCLdf4AuryewHBFK/tgkM+qLs88NWEJtMvxO4PG95FeKj5oVvPBCbYuRxfJOuZcEX2wkBJHprkYmjdAvktaSn7iiEZyMM+fGVo1QPe7jUB8CEAc07CDADMsfFhwd3kcElZgSvd0JqiyijS31d8pXxhqcFUZBiXT5ZguVdlCic+09UUPKPwGt0wN+98Ujw66/wtMm8mKNirNGfEQiQ+TCImjgsc2guntHscPeODLdq3/SQqWVGPQJlca3cHLyu3Oij9hanMYNF2wnUuHRbhaFjz+wlnDFlbnrONCuIR4oYgzEfRv+Sx24Y6iuU0dqDMyP8ITBzq8p0zlBp1x6se6uNdFhRCPHV/og/JF1vn/MDXEOjV6MoCd+QDvcg1jVYleZJ6FR2poXsg4LoMWrWQzhdCha+lY8hSQkotw9dBRsYpP7xPyU9YU9X1MvEB8nvUAckYpjwULp//hlJTRI5b0+FRwEs+RExoOMwmZSXA49y6ytSVS6K7f6UscSNYcI/ITF7/Z6I4L6Z0erKMt18sZlgmZhy1FGxN5P2IfoIt1gmwj8B3C+fqc3rAS0Dj8w0vmF5rvDXknXBi4iTn6g+HQL3k/HzuGFk+moY5nAw2KL9EOO+w6Yo8yh892a1im85Eca7kQL5R4n+Vea9P/UzTqgI/CHHh3kAsbLAb3iof2uu4Aj8W8+laGZfZX1QnDN/+bb2I6H0tC+q4qO7ciIQLxuDGwHP/lrxSKVO9oxQzyJZ/4oQCaCyciASrQmu8BR8BYjSoUVKahrX31nMGIf7AcDcGoMaKAYAmM4ET4feJIlFcRQC1WFuBWvStJOj/5jL8Esdo0FYEsPpyo/ZT7StD27kpEBbetFyXs8qe9fwQOab7GLFxtxuem//xAzFhKw7999yFYNDtK6AVtTPcTndkJbyH+tzhQ+oQBHCjvss2n6C5HLUhnLOy/hIva87Zwi6FI7Hnx/nVrVToQMeRdGMQwY9fnxJpS0swP9+KElJ3zp1n0Bw5AfaZVZhT5bmgNDrIU8e9BQgH8ol9xZ9Nj1FimF7dWzhf5cM7VLxBKw3K1wfRKGwm6bPGQDCa9cN1CrLx3i8fNzEVN8ynKeN+/8g/ewyCoZDENl8kv7jKPTaurhIDweMCi7quBBW10oD6roudnaUY1YFJLcNtugqTlPJgWISGWbQDyFOM0A3Xcqukv2d22j08gK4O/xh0vz/LnElYKVCYJToyEEZayvKxS80VXSQqW8x7M90O4Yzzh58h+RQ/ZkuUF4J1mCZku4Ug4KWRvWKWYWdG4aaybTrkFBlIb/Abf8dh6CYYTfKAs67HXn53wsUnNevyogf6SKQHPLEfyoxmrShdww42BqWSt9vi9a4SrxQS1Sc7YS06+yw1u9RksTnwirlptcUQsWNg42VNIBpMIs7Gxyk2VuRbDBKc84fUCi4fv7tReXRvCOyFs36ajDETXikf3UDx/zOxtW+BKx894d1gaRZdmo3U8oLY8vNBYEyHkDiHkGd378m7p/HxSp1b3Y0sDLwnSDdKvwm8bL6C2rneY+sJXfib+/rVR03Hi2+Qw+r9OdTNtsGmP/k3qrNxiZtr1KSAtfCIZYcJRUzBIOY5sfJEU5PS7EJaIjgAA/vL0LQn5VRYfNHHXhg/Ch4ueVDnOsMbxSj/k9ko4GOAVNAlgojmBVQHgmF+JKeQS4ERWqmMSAEENTCoqBHT1Q6UdIJTBdiJ40go5c3mG6ds844JBGcuVTlGCMJkcDPD9ZJfJuFY+0+wMPOfKa0tv5voBXXPiOQeLLdMI4yqCCaINEd9gG6vTDjbzuciPpmrrGyF583q+6BFM1xUNXKpubAOIEBFBYlPwAAA="
          alt="Nextuber"
          style={{ width: "140px", display: "block", margin: "0 auto", borderRadius: "8px" }}
        />
      </div>

      <div className="nav-section">
        <div className="nav-lbl">Painel</div>
        <div
          className={`nav-item ${activePage === "overview" ? "active" : ""}`}
          onClick={() => onPageChange("overview")}
        >
          ◈ Página inicial
        </div>
        {isTutora && (
          <div
            className={`nav-item ${activePage === "estagiarios" ? "active" : ""}`}
            onClick={() => onPageChange("estagiarios")}
          >
            ◎ Acompanhamento
          </div>
        )}
        {(isTutora || isGGA) && (
          <div
            className={`nav-item ${activePage === "cadastro" ? "active" : ""}`}
            onClick={() => onPageChange("cadastro")}
          >
            ◫ Cadastro
          </div>
        )}
      </div>

      <div className="nav-section">
        <div className="nav-lbl">Programa</div>
        {isTutora && (
          <div
            className={`nav-item ${activePage === "trilhas" ? "active" : ""}`}
            onClick={() => onPageChange("trilhas")}
          >
            ◑ Trilhas
          </div>
        )}
        <div
          className={`nav-item ${activePage === "agendamentos" ? "active" : ""}`}
          onClick={() => onPageChange("agendamentos")}
        >
          ◉ Agendamentos
        </div>
      </div>

      {isTutora && (
        <div className="nav-section">
          <div className="nav-lbl">Sistema</div>
          <div
            className={`nav-item ${activePage === "configuracoes" ? "active" : ""}`}
            onClick={() => onPageChange("configuracoes")}
          >
            ⚙ Configurações
          </div>
        </div>
      )}

      {isTutora && (
        <div className="sb-progress">
          <div className="sb-progress-row">
            <span>PROGRESSO</span>
            <span>—</span>
          </div>
          <div className="sb-track">
            <div className="sb-fill" style={{ width: "0%" }}></div>
          </div>
        </div>
      )}

      <div className="sb-mode">
        {!session ? (
          <button className="btn-mode" onClick={onLoginClick}>
            Fazer login
          </button>
        ) : (
          <button
            className="btn-mode"
            style={{ background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--border2)" }}
            onClick={onLoginClick}
          >
            👤 Meu perfil
          </button>
        )}
      </div>

      <div className="sb-footer" style={{ padding: "12px 14px", borderTop: "1px solid var(--border2)", fontSize: "11px", color: "var(--ink3)", lineHeight: "1.5" }}>
        <div><span style={{ fontWeight: 500, color: "var(--ink2)" }}>Tutora Geral:</span> Kamilla Silva</div>
        <div style={{ marginTop: "2px" }}><span style={{ fontWeight: 500, color: "var(--ink2)" }}>Desenvolvedor:</span> Luiz Gustavo Verli</div>
      </div>
    </aside>
  );
}
