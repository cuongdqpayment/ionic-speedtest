
import { Injectable } from '@angular/core';
import * as exif from 'exif-js';

const orientation_standard = {
    1:0,
    3:180,
    6:90,
    8:270
}

@Injectable()
export class ApiImageService {



    constructor() { }
    
    //dua vao doi tuong file image
    //tra ve doi tuong file image co kich co nho hon
    resizeImage(filename: string, file: any, newSize: number) {
        return new Promise((resolve, reject) => {

            if (file){

                let allMetaData;
                let originOrientation;
                exif.getData(file, function () {
                    allMetaData = exif.getAllTags(this);
                    originOrientation = allMetaData.Orientation;
                    //console.log("get Tags Orientation",allMetaData);
                });


                try {
                    let canvas = document.createElement('canvas');
                    let context = canvas.getContext('2d');
                    let img = document.createElement('img');
                    let maxW = newSize;
                    let maxH = newSize;
                    img.src = URL.createObjectURL(file);
                    
                    img.onload = () => {
                        let iw = img.width;
                        let ih = img.height;
                        let scale = Math.min((maxW / iw), (maxH / ih));
                        let iwScaled = (scale<=0||scale>1)?iw: iw * scale;
                        let ihScaled = (scale<=0||scale>1)?ih: ih * scale;
                        
                        //giam kich thuoc
                        canvas.width = iwScaled;
                        canvas.height = ihScaled;
                        context.drawImage(img, 0, 0, iwScaled, ihScaled);
                        
                        //quay
                        let imageNew = document.createElement('img');
                        imageNew.src = canvas.toDataURL();

                        imageNew.onload = () => {
                            
                            if (originOrientation>2&&originOrientation<=4){
                                //console.log('rotate 180');
                                canvas.width = imageNew.width;
                                canvas.height = imageNew.height;
                                context.rotate(180 * Math.PI / 180);
                                context.drawImage(imageNew, -imageNew.width, -imageNew.height);
                                
                            } else if (originOrientation>4&&originOrientation<=7){
                                //rotate 90
                                //console.log('rotate 90');
                                canvas.width = imageNew.height;
                                canvas.height = imageNew.width;
                                context.rotate(90 * Math.PI / 180);
                                context.drawImage(imageNew, 0 , -imageNew.height);
                                
                            } else if (originOrientation>7&&originOrientation<=9){
                                //rotate 270
                                //console.log('rotate 270');
                                canvas.width = imageNew.height;
                                canvas.height = imageNew.width;
                                context.rotate(270 * Math.PI / 180);
                                context.drawImage(imageNew, -imageNew.width, 0);
    
                            }
                            
                            canvas.toBlob((blob) => {
                                let reader = new FileReader();
                                reader.readAsArrayBuffer(blob);
                                reader.onload = () => { 
                                    let newFile = new Blob([reader.result], { type: 'image/jpeg' });
                                    resolve({
                                        image: canvas.toDataURL(), //base64 for view and json post
                                        file: newFile //formData post
                                        ,filename: filename
                                        ,h1: filename
                                        ,p: " ***Kích cỡ cũ: " + file.size 
                                         + "(" + img.width + "x" + img.height + ")"
                                         + " * Kiểu file cũ: " + file.type 
                                         + " * Hướng ảnh chụp: "  + orientation_standard[(originOrientation?originOrientation:1)]
                                         + "(" + (originOrientation?"("+ originOrientation +")":"1") +")"
                                         + " ***Kích cỡ mới: BIN=" + newFile.size 
                                         + "(" + canvas.width + "x" + canvas.height + ") Base64="+ canvas.toDataURL().length+""
                                         + " * Kiểu file mới: " + newFile.type 
                                         + " ***Các tham số tạo ảnh: " 
                                         + (allMetaData&&allMetaData.Make?" * Hãng sx máy ảnh: "+allMetaData.Make:"")
                                         + (allMetaData&&allMetaData.Make?" * Đời máy ảnh: "+allMetaData.Model:"")
                                         + (allMetaData&&allMetaData.Software?" * Phần mềm: "+allMetaData.Software:"")
                                         + (allMetaData&&allMetaData.DateTime?" * Ngày giờ: "+allMetaData.DateTime:"")
                                         + (allMetaData&&allMetaData.DateTimeOriginal?" * Ngày giờ gốc: "+allMetaData.DateTimeOriginal:"")
                                         + (allMetaData&&allMetaData.DateTimeDigitized?" * Ngày giờ số hóa: " + allMetaData.DateTimeDigitized:"")
                                         + (allMetaData&&allMetaData.GPSLatitude?" * Vĩ Độ: " + allMetaData.GPSLatitude + allMetaData.GPSLatitudeRef:"")
                                         + (allMetaData&&allMetaData.GPSLongitude?" * Kinh Độ: " + allMetaData.GPSLongitude + allMetaData.GPSLongitudeRef:"")
                                         + (allMetaData&&allMetaData.GPSDateStamp?" * Ngày giờ tọa độ: " + allMetaData.GPSDateStamp + allMetaData.GPSTimeStamp:"")

                                         ,h3:(file.lastModified?new Date(file.lastModified).toISOString():file.lastModifiedDate)
                                         ,note: JSON.stringify(allMetaData)
                                        ,last_modified: file.lastModified?file.lastModified:file.lastModifiedDate.getTime()
                                        ,subtitle: (file.lastModified?new Date(file.lastModified).toLocaleDateString():file.lastModifiedDate) + (originOrientation?"("+ originOrientation +")":"") 
                                        ,width: canvas.width //cho biet anh nam doc hay nam ngang
                                        ,height: canvas.height 
                                        ,orientation_old: originOrientation
                                        ,size_old: file.size
                                        ,type_old: file.type
                                        ,size: newFile.size
                                        ,type: newFile.type
                                    });
                                }
                            });
                        }
                        
                    }
                } catch (err) { reject(err);}
            }else{
                reject("No file!");
            }

        });
    }
}